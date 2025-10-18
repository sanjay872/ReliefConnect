import OpenAI from "openai";
import { getProductCollection } from "./chromaClient.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a vector embedding for a given text using OpenAI.
 */
async function embedText(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (err) {
    console.error("Failed to generate embedding:", err);
    return null;
  }
}

/**
 * Add or update a single product in Chroma.
 * Called by Mongoose post-save and post-findOneAndUpdate hooks.
 */
export async function updateSingleProductIntoChroma(product) {
  try {
    if (!product) return;

    const { _id, name, description, category, quantity } = product;
    const text = `${name}: ${description}`;
    const embedding = await embedText(text);
    if (!embedding) return;

    const collection = await getProductCollection();

    await collection.upsert({
      ids: [_id.toString()],
      embeddings: [embedding],
      metadatas: [
        {
          id: _id.toString(),
          name,
          category,
          quantity,
        },
      ],
      documents: [text],
    });

    console.log(`Synced product "${name}" (${_id}) to Chroma.`);
  } catch (err) {
    console.error("Chroma sync (upsert) failed:", err);
  }
}

/**
 * Delete a product from Chroma by its ID.
 * Called by Mongoose post-deleteOne hook.
 */
export async function deleteProductFromChroma(productId) {
  try {
    const collection = await getProductCollection();
    await collection.delete({ ids: [productId] });
    console.log(`Deleted product ${productId} from Chroma.`);
  } catch (err) {
    console.error("Chroma delete failed:", err);
  }
}
