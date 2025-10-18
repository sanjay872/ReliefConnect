import fetch from "node-fetch";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001/recommend";

export async function recommendProducts(query) {
    console.log(query)
  try {
    const response = await fetch(AI_SERVICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({"query":query}),
    });
    const data = await response.json();
    console.log(data)
    return data;
  } catch (err) {
    console.error("AI Service error:", err.message);
    return { error: "AI service unavailable" };
  }
}