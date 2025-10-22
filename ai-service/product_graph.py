import os
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from chroma_client import get_chroma_collection

# Define state
class GraphState(BaseModel):
    query: str = ""
    intent: str | None = None
    products: List[Dict[str, Any]] = Field(default_factory=list)
    response: str | None = None
    history:List[str] = Field(default_factory=list)

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=os.getenv("OPENAI_API_KEY"))
chroma = get_chroma_collection()
session: Dict[str,GraphState]={}

def classify(state: GraphState):
    """Classify user intent."""
    msg = f"""
    You are a disaster relief system assistant.
    Your job is to classify the user's request into one of:
    - "product": if the user is asking about relief items, kits, supplies, tools, tents, food, medical kits, shelter, or any kind of physical aid or resource.
    - "order": if the user is asking about tracking, confirming, cancelling, or creating an order.
    - "fraud": if the user mentions suspicious activity, fake relief operations, or scams.
    - "other": for greetings, unrelated messages, or general help.

    Here are examples:
    1. "I need food or water" → product
    2. "Where can I get a tent or shelter?" → product
    3. "My order is missing" → order
    4. "Someone is running a fake donation drive" → fraud
    5. "Hi, how are you?" → other

    Now classify this message:
    "{state.query}"

    Respond with only one word from [product, order, fraud, other].
    """

    res = llm.invoke(msg)
    label = res.content.strip().lower()
    print(f"🧭 Classifier detected intent: {label}")
    state.intent = label
    return state


def search_products(state: GraphState):
    if state.intent != "product":
        return state

    query = state.query
    print(chroma.metadata)
    results = chroma.query(query_texts=[query], n_results=5)

    print("\n🔍 Raw Chroma Results:")
    for i in range(len(results["ids"][0])):
        print(f"→ {results['documents'][0][i]} | dist={results['distances'][0][i]:.4f}")

    threshold = 1
    products = []

    for id_, doc, meta, dist in zip(
        results["ids"][0],
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0]
    ):
        if dist <= threshold:
            products.append({
                "id": id_,
                "description": doc,
                "distance": round(dist, 4),
                **meta
            })

    state.products = products
    print(f"Filtered products: {len(products)} passed the threshold {threshold}")
    return state

def summarize(state: GraphState):
    """Generate a friendly response using LLM."""
    if state.intent != "product":
        state.response = "I can assist with disaster relief products or order inquiries. Please specify your request."
        return state

    elif not state.products:
        state.response = "No matching products found."
        return state
    else:
        prompt = f"""
            Format your answer in clean **Markdown** suitable for chat display.

            For each product:
            - Include emoji (from its metadata if available)
            - Name as a bold heading
            - Use bullet points for Description, Utility, Price, and Availability
            - End with a one-line helpful note

            User query: "{state.query}"
            Products: {state.products}
        """
        result = llm.invoke(prompt)
        state.response = result.content

    state.history.append(f"bot:{state.response}")
    return state

# --- Build Graph ---
graph = StateGraph(GraphState)

graph.add_node("classify", classify)
graph.add_node("search", search_products)
graph.add_node("summarize", summarize)

graph.set_entry_point("classify")
graph.add_edge("classify", "search")
graph.add_edge("search", "summarize")
graph.add_edge("summarize", END)

compiled_graph = graph.compile()

def run_product_graph(session_id:str,query: str) -> Dict[str, Any]:
    print(session_id,query)

    state = session.get(session_id,GraphState(history=[]))
    
    if isinstance(state, dict):
        state = GraphState(**state)
    elif state is None:
        state = GraphState(history=[])

    context_text = "\n".join(state.history[-6:]) if state.history else ""
    state.query = f"{context_text}\nuser: {query}" if context_text else query

    new_state=compiled_graph.invoke(state)

    session[session_id]=new_state

    return {
        "intent": new_state["intent"],
        "response": new_state["response"],
        "products": new_state["products"],
        "history": new_state["history"]
    }
