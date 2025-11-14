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
        Issue Type: {req.issue_type}
        Customer Problem: {req.order_problem}

        Return ONLY JSON in this structure:
        {json_example}
        """
    )

    resp = text_llm.invoke([system, human])
    result = extract_json(resp.content)
    return {**state, "fraud_result": result}



def image_analysis_node(state: State) -> State:
    req: OrderIssueRequest = state["request"]

    if not req.image:
        return state  # skip

    data_url = f"data:image/jpeg;base64,{req.image}"

    system = SystemMessage(
        content=(
            "You are an AI that verifies image evidence for damaged/missing item claims. "
            "Respond ONLY with JSON."
        )
    )

    human = HumanMessage(
        content=[
            {
                "type": "text",
                "text": f"""
Inspect the customer-provided image and evaluate if it supports the claim.

Order: {req.order.json(indent=2)}
Issue Type: {req.issue_type}
Problem Description: {req.order_problem}

Return ONLY JSON:
{{
  "image_relevant": true/false,
  "supports_claim": true/false,
  "suspicious_signals": ["..."],
  "short_summary": "..."
}}
"""
            },
            {
                "type": "image_url",
                "image_url": {"url": data_url}
            }
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
        content=(
            "You are a senior customer support specialist and risk-aware decision maker "
            "for an e-commerce platform. Respond ONLY with JSON."
        )
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

Issue Type: {req.issue_type}
Customer Problem: {req.order_problem}

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
    return "has_image" if req.image else "no_image"


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