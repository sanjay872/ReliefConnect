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
    state.history.append(f"user: {state.query}")
    return state

def search_products(state: GraphState):
    """Query Chroma for vector similarity and apply strict threshold."""
    if state.intent != "product":
        return state

    query = state.query
    print(chroma.metadata)
    results = chroma.query(query_texts=[query], n_results=5)

    # 🧩 Debug print
    print("\n🔍 Raw Chroma Results:")
    for i in range(len(results["ids"][0])):
        print(f"→ {results['documents'][0][i]} | dist={results['distances'][0][i]:.4f}")

    # Apply filter
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
    # for i, distance in enumerate(results['distances'][0]):
    #     # For cosine: 0 = perfect match, < 0.4 = good match
    #     if distance < 0.4:  # Adjust this threshold
    #         products.append({
    #             'document': results['documents'][0][i],
    #             'metadata': results['metadatas'][0][i],
    #             'distance': distance,
    #             'similarity': 1 - (distance / 2)  # Normalized similarity
    #         })   

    state.products = products
    print(f"✅ Filtered products: {len(products)} passed the threshold {threshold}")
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
        Summarize these relief products for this query: "{state.query}"
        Products: {state.products}
        Keep it brief and helpful.
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
    
     # Convert dict → GraphState if needed
    if isinstance(state, dict):
        state = GraphState(**state)
    elif state is None:
        state = GraphState(history=[])

    # 🧠 2️⃣ Update the query with recent conversation context
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
