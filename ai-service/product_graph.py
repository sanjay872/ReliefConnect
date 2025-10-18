import os
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from chroma_client import get_chroma_collection

# Define state
class GraphState(BaseModel):
    query: str
    intent: str = None
    products: List[Dict[str, Any]] = Field(default_factory=list)
    response: str = None

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=os.getenv("OPENAI_API_KEY"))
chroma = get_chroma_collection()

# --- Nodes ---
def classify(state: GraphState):
    """Classify user intent."""
    msg = f"""
    You are a relief system assistant.
    Classify the intent of this message into one of: [product, order, fraud, other].
    Message: {state.query}
    Respond with only the label.
    """
    res = llm.invoke(msg)
    state.intent = res.content.strip().lower()
    return state

def search_products(state: GraphState):
    """Query Chroma for vector similarity."""
    if state.intent != "product":
        return state

    query = state.query
    results = chroma.query(query_texts=[query], n_results=3)

    products = []
    for id_, doc, meta in zip(results["ids"][0], results["documents"][0], results["metadatas"][0]):
        products.append({ "id": id_, "description": doc, **meta })

    state.products = products
    return state

def summarize(state: GraphState):
    """Generate a friendly response using LLM."""
    if state.intent != "product":
        state.response = "I can assist with disaster relief products or order inquiries. Please specify your request."
        return state

    if not state.products:
        state.response = "No matching products found."
        return state

    prompt = f"""
    Summarize these relief products for this query: "{state.query}"
    Products: {state.products}
    Keep it brief and helpful.
    """
    result = llm.invoke(prompt)
    state.response = result.content
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

def run_product_graph(query: str) -> Dict[str, Any]:
    state = compiled_graph.invoke(GraphState(query=query))
    return {
        "intent": state.get("intent"),
        "response": state.get("response"),
        "products": state.get("products", [])
    }
