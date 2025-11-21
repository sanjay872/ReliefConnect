import json
import re
from typing import Any, Dict, Optional, List

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END
from models import OrderIssueRequest, OrderDecisionResponse 

# ==========================
# 2. Graph State
# ==========================

State = Dict[str, Any]


# ==========================
# 3. LLM Setup
# ==========================

# text reasoning LLM
text_llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.1,
)

# vision-enabled LLM
vision_llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.1,
)


# ==========================
# 4. JSON extraction helper
# ==========================

def extract_json(text: str) -> Dict[str, Any]:
    """Extract JSON even if LLM adds warnings or extra text."""
    try:
        return json.loads(text)
    except Exception:
        pass

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError(f"Could not parse JSON from: {text}")

    return json.loads(match.group(0))


# ==========================
# 5. Graph Nodes
# ==========================

def fraud_check_node(state: State) -> State:
    req: OrderIssueRequest = state["request"]

    system = SystemMessage(
        content=(
            "You are an expert fraud analyst for an e-commerce company. "
            "Look for risky patterns, contradictions, or refund abuse. "
            "Respond ONLY with JSON. No markdown."
        )
    )

    json_example = """
    {
    "fraud_flag": true,
    "fraud_risk_level": "low",
    "reasons": ["..." ],
    "suggested_action_hint": "likely_legit"
    }
    """

    human = HumanMessage(
        content=f"""
        Analyze for fraud:

        Order: {req.order.model_dump_json(indent=2)}
        Issue Type: {req.issueType}
        Customer Problem: {req.orderProblem}

        Return ONLY JSON in this structure:
        {json_example}
        """
    )

    resp = text_llm.invoke([system, human])
    result = extract_json(resp.content)
    return {**state, "fraud_result": result}


import json, base64

def image_analysis_node(state: State) -> State:
    req = state["request"]

    if not req.images:
        return state

    # img is already a base64 string
    image_inputs = [
        {
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{img}"
            }
        }
        for img in req.images
    ]

    order_json = json.dumps(req.order.model_dump(), indent=2)

    system = SystemMessage(
        content="You are an AI verifying image evidence. Respond ONLY with JSON."
    )

    human = HumanMessage(
        content=[
            {
                "type": "text",
                "text": f"""
Inspect the images and evaluate the claim.

Order:
{order_json}

Issue Type: {req.issueType}
Problem Description: {req.orderProblem}
"""
            },
            *image_inputs
        ]
    )

    resp = vision_llm.invoke([system, human])
    result = extract_json(resp.content)

    return {**state, "image_result": result}




def decision_node(state: State) -> State:
    req: OrderIssueRequest = state["request"]
    fraud_result: Dict[str, Any] = state.get("fraud_result", {})
    image_result: Dict[str, Any] = state.get("image_result", {})

    system = SystemMessage(
    content="""
        You are a senior risk-aware support specialist making FINAL decisions on refund tickets.
        Respond ONLY with JSON.

        You MUST follow these rules STRICTLY:

        1. If image analysis indicates the package is **intact / undamaged**, 
        and the customer's reported issue is "damaged item" or similar,
        then decision MUST be "refund_denied", unless fraud analysis indicates high risk of abuse 
        (in which case escalate).

        2. If images clearly show damage, then decision MUST be "refund_approved".

        3. If fraud_risk_level is "high" AND image evidence does not support the customer claim,
        decision MUST be "refund_denied" with internal_notes = "Potential refund abuse".

        4. If images are ambiguous, choose "manual_review_required".
        Never guess.

        Allowed decision values:
        - refund_approved
        - refund_denied
        - manual_review_required

        Respond ONLY with JSON.
    """
    )

    # JSON example must be separated to avoid f-string format errors
    example_json = """
{
  "decision": "refund_approved",
  "reason": "short internal reason",
  "polite_message": "Friendly message",
  "internal_notes": "",
  "fraud_flag": false,
  "fraud_risk_level": "low"
}
"""

    human = HumanMessage(
        content=f"""
Make the FINAL DECISION.

Order:
{req.order.model_dump_json(indent=2)}

Issue Type: {req.issueType}
Customer Problem: {req.orderProblem}

Fraud Analysis:
{json.dumps(fraud_result, indent=2)}

Image Analysis:
{json.dumps(image_result, indent=2)}

Return ONLY JSON using this structure:
{example_json}
"""
    )

    resp = text_llm.invoke([system, human])
    final = extract_json(resp.content)

    validated = OrderDecisionResponse(**final)
    return {**state, "decision": validated.dict()}



# ==========================
# 6. Graph Wiring
# ==========================

def has_image_condition(state: State) -> str:
    req: OrderIssueRequest = state["request"]
    return "has_image" if req.images else "no_image"


def build_graph():
    graph = StateGraph(State)

    graph.add_node("fraud_check", fraud_check_node)
    graph.add_node("image_analysis", image_analysis_node)
    graph.add_node("decision", decision_node)

    graph.set_entry_point("fraud_check")

    graph.add_conditional_edges(
        "fraud_check",
        has_image_condition,
        {
            "has_image": "image_analysis",
            "no_image": "decision"
        }
    )

    graph.add_edge("image_analysis", "decision")
    graph.add_edge("decision", END)

    return graph.compile()

graph_app = build_graph()

def invokeOrderGraph(data):
    result = graph_app.invoke({"request":data})
    return OrderDecisionResponse(**result["decision"])