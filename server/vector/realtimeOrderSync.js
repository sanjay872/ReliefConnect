import OpenAI from "openai";
import { getOrderCollection } from "./chromaClient.js";

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

function toOrderMetadata(order) {
  const safe = (v) => {
    if (v === undefined || v === null) return null;
    if (typeof v === "object") return JSON.stringify(v);
    return v;
  };

  const meta = {
    // Identifiers
    id: safe(order._id?.toString()),
    orderId: safe(order.orderId),
    userId: safe(order.userId),
    userName: safe(order.name),

    // Status & Urgency
    status: safe(order.status),          // processing, shipped, etc.
    urgency: safe(order.urgency),        // low, medium, high

    // Payment
    paid: safe(order.payment?.paid),
    paymentMethod: safe(order.payment?.method),
    amount: safe(order.payment?.amount),
    currency: safe(order.payment?.currency),

    // Order attributes
    isPackage: safe(order.isPackage),
    itemCount: safe(Array.isArray(order.items) ? order.items.length : 0),

    // Time
    timestamp: safe(order.timestamp),

    // Optional shipping/communication
    address: safe(order.address),
    phone: safe(order.phone),
    email: safe(order.email),
  };

  // ✅ Remove null fields for cleaner metadata
  Object.keys(meta).forEach((k) => {
    if (meta[k] === null) delete meta[k];
  });

  return meta;
}


export async function updateSingleOrderIntoChroma(order) {

  try {
    if (!order) return;
    const text = `
        Order Summary:
        Order ID: ${order._id}
        User: ${order.name} (${order.userId})
        Status: ${order.status}
        Urgency: ${order.urgency}
        Items: ${order.items.map(i => `${i.name} (x${i.quantity})`).join(", ")}
        Total Paid: ${order.payment?.amount ?? 0} ${order.payment?.currency ?? ""}
        Payment Method: ${order.payment?.method ?? "unknown"} | Paid: ${order.payment?.paid}
        Shipping Address: ${order.address}
        Phone: ${order.phone}
        Email: ${order.email}
        Package Order: ${order.isPackage}
        Timestamp: ${order.timestamp}
    `;
    const embedding = await embedText(text);
    if (!embedding) return;

    const collection = await getOrderCollection();

    await collection.upsert({
      ids: [order._id.toString()],
      embeddings: [embedding],
      metadatas: [
        toOrderMetadata(order)
      ],
      documents: [text],
    });

    console.log(`Synced order (${order._id}) to Chroma.`);
  } catch (err) {
    console.error("Chroma sync (upsert) failed:", err);
  }
}

export async function deleteOrderFromChroma(orderId) {
  try {
    const collection = await getOrderCollection();
    await collection.delete({ ids: [orderId] });
    console.log(`Deleted order ${orderId} from Chroma.`);
  } catch (err) {
    console.error("Chroma delete failed:", err);
  }
}
