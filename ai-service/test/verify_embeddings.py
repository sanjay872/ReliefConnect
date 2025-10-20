import os
import numpy as np
import chromadb
from chromadb.utils import embedding_functions
from openai import OpenAI

# ✅ Load environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", 8000))

# ✅ Create Chroma client and embedding function
client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)

embedding_func = embedding_functions.OpenAIEmbeddingFunction(
    api_key=OPENAI_API_KEY,
    model_name="text-embedding-3-small"
)

collection = client.get_or_create_collection(
    name="relief_products",
    embedding_function=embedding_func
)

# ✅ Peek at what’s stored
peek = collection.peek()
if not peek["ids"]:
    print("❌ No documents found in Chroma.")
    exit()

# 🧠 Inspect a random sample
print(f"📦 Collection: relief_products")
print(f"🧾 Total items: {collection.count()}")
print(f"📝 Sample document: {peek['documents'][0]}")
print(f"🆔 Sample ID: {peek['ids'][0]}")

# ✅ Generate a fresh embedding for that same text using OpenAI directly
client_oa = OpenAI(api_key=OPENAI_API_KEY)

text = peek["documents"][0]
embedding_direct = client_oa.embeddings.create(
    model="text-embedding-3-small",
    input=text
).data[0].embedding

embedding_direct = np.array(embedding_direct)

# ✅ Retrieve the stored embedding from Chroma
# We’ll query Chroma for the same doc text, which gives its closest stored vector
query_results = collection.query(
    query_texts=[text],
    n_results=1,
    include=["distances"]
)

distance = query_results["distances"][0][0]

print(f"\n✅ Verification Results:")
print(f"Queried text: {text[:60]}...")
print(f"Distance between OpenAI embedding and stored vector: {distance:.4f}")

if distance < 0.15:
    print("🟢 Embeddings are aligned — Chroma and OpenAI use the same model.")
elif distance < 0.35:
    print("🟡 Embeddings somewhat aligned — minor drift (check versions or data).")
else:
    print("🔴 Embeddings misaligned — models differ or Chroma collection used default embedder.")

# ✅ Optional: test a new query
query = input("\nType a search query to test Chroma similarity: ")
if query:
    res = collection.query(query_texts=[query], n_results=3, include=["distances", "documents"])
    print("\n🔍 Query results:")
    for doc, dist in zip(res["documents"][0], res["distances"][0]):
        print(f"→ {doc[:80]} | dist={dist:.4f}")