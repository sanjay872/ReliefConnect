import chromadb
import os
from chromadb.utils import embedding_functions

def get_chroma_collection():
    """Connect to Chroma with OpenAI embeddings enabled."""
    openai_api_key = os.getenv("OPENAI_API_KEY")
    client = chromadb.HttpClient(
        host=os.getenv("CHROMA_HOST", "localhost"),
        port=int(os.getenv("CHROMA_PORT", 8000)),
    )

    embedding_func = embedding_functions.OpenAIEmbeddingFunction(
        api_key=openai_api_key,
        model_name="text-embedding-3-small"
    )

    # Delete existing collection if it exists (one-time operation)
    # try:
    #     client.delete_collection(name="relief_products")
    #     print("Deleted existing collection")
    # except Exception as e:
    #     print(f"No existing collection to delete: {e}")

    # Create collection with explicit metadata
    collection = client.get_or_create_collection(
        name="relief_products",
        embedding_function=embedding_func,
        metadata={"hnsw:space": "cosine"}
    )
    
    print(f"Collection metadata: {collection.metadata}")
    return collection
