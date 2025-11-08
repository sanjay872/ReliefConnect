import { ChromaClient} from 'chromadb';

const chromaHost = process.env.CHROMA_HOST || "localhost";
const chromaPort = process.env.CHROMA_PORT || 8000;

const chromaClient = new ChromaClient({
  path: `http://${chromaHost}:${chromaPort}`,
});

// Create a no-op embedding function that tells Chroma we'll provide embeddings manually
class NoOpEmbeddingFunction {
  constructor() {
    this.name = "NoOpEmbeddingFunction";
  }

  async generate(texts) {
    // Return empty arrays - we'll provide embeddings manually
    return texts.map(() => []);
  }
}

export async function getProductCollection() {
  try {
    const collection = await chromaClient.getOrCreateCollection({
      name: "relief_products",
      metadata: { "hnsw:space": "cosine" },
      embeddingFunction: new NoOpEmbeddingFunction(),    // ✅ Explicitly set distance metric
    });
    
    console.log("Collection metadata:", collection.metadata);
    return collection;
  } catch (error) {
    console.error("Failed to get or create Chroma collection:", error);
    throw error;
  }
}

export async function getOrderCollection() {
  try {
    const collection = await chromaClient.getOrCreateCollection({
      name: "relief_orders",
      metadata: { "hnsw:space": "cosine" },
      embeddingFunction: new NoOpEmbeddingFunction(),    // ✅ Explicitly set distance metric
    });
    
    console.log("Collection metadata:", collection.metadata);
    return collection;
  } catch (error) {
    console.error("Failed to get or create Chroma collection:", error);
    throw error;
  }
}

export default chromaClient;