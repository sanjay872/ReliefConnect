import os
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from product_graph import run_product_graph
from langchain_openai import ChatOpenAI

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