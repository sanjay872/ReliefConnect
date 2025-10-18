// server/vector/chromaClient.js
import { ChromaClient } from "chromadb";

const chromaHost = process.env.CHROMA_HOST || "localhost";
const chromaPort = process.env.CHROMA_PORT || "8000";

const chromaClient = new ChromaClient({
  path: `http://${chromaHost}:${chromaPort}`,
});

export async function getProductCollection() {
  try {
    const collection = await chromaClient.getOrCreateCollection({
      name: "relief_products",
    });
    return collection;
  } catch (error) {
    console.error("Failed to get or create Chroma collection:", error);
    throw error;
  }
}

export default chromaClient;
