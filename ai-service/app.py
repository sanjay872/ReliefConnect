import os
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from product_graph import run_product_graph
from langchain_openai import ChatOpenAI
from models import OrderIssueRequest, OrderDecisionResponse
from order_graph import invokeOrderGraph
import base64

app = FastAPI(title="ReliefConnect AI Service", version="1.0")
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=os.getenv("OPENAI_API_KEY"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/recommend")
async def recommend(payload: dict = Body(...)):
    session_id=payload.get("session_id","default")
    query = payload.get("query","")
    if not query:
        return {"error": "query is required"}
    print(query)
    result = await run_product_graph(session_id,query)
    return result

@app.post("/report", response_model=OrderDecisionResponse)
async def report(data: OrderIssueRequest):
    print(data)

    # decoded_images = []

    # # Check if list exists
    # if data.images and isinstance(data.images, list):
    #     for img_str in data.images:
    #         try:
    #             img_bytes = base64.b64decode(img_str)
    #             decoded_images.append(img_bytes)
    #         except Exception as e:
    #             print("Error decoding image:", e)

    # # Attach decoded images back to the data
    # data.images = decoded_images  

    # Now pass to your AI graph
    res = invokeOrderGraph(data)
    print(res)

    return res

@app.post("/summarize")
def summarize(payload: dict = Body(...)):
    text = payload.get("text")
    if not text:
        return {"error": "text is required"}

    prompt = f"""
    Summarize the following conversation between a user and a bot in 1-2 sentences.
    Focus on what the user is looking for.

    Conversation:
    {text}
    """

    result = llm.invoke(prompt)
    return {"summary": result.content.strip()}