import ChatHistory from "../models/chat.js";
import fetch from "node-fetch";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001/recommend";
const SUMMARY_URL = process.env.SUMMARY_URL || "http://localhost:8001/summarize"; // ✅ new FastAPI endpoint

export async function getOrCreateChat(userId) {
  let chat = await ChatHistory.findOne({ userId });
  if (!chat) chat = await ChatHistory.create({ userId, messages: [] });
  return chat;
}

async function summarizeChat(messages) {
  try {
    const text = messages.map(m => `${m.sender}: ${m.text}`).join("\n");
    const response = await fetch(SUMMARY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const data = await response.json();
    return data.summary || "";
  } catch (err) {
    console.error("Summary failed:", err.message);
    return "";
  }
}

export async function sendMessageToAI(userId, userMessage) {
  const chat = await getOrCreateChat(userId);

  // ✅ 1. If chat too long → summarize old messages
  if (chat.messages.length > 20) {
    const oldMessages = chat.messages.slice(0, 15); // summarize first 15
    const summary = await summarizeChat(oldMessages);

    // Replace with summary and keep recent messages
    chat.messages = [
      { sender: "bot", text: `Summary of previous conversation: ${summary}` },
      ...chat.messages.slice(15)
    ];
    await chat.save();
  }

  // ✅ 2. Combine messages for context
  const context = chat.messages.map(m => `${m.sender}: ${m.text}`).join("\n");

  // ✅ 3. Send to FastAPI recommender
  const payload = { query: `${context}\nuser: ${userMessage}` };
  const response = await fetch(AI_SERVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json();

  // ✅ 4. Save conversation
  chat.messages.push({ sender: "user", text: userMessage });
  chat.messages.push({ sender: "bot", text: data.response || "No response available." });
  await chat.save();

  return {
    intent: data.intent || "product",
    response: data.response,
    products: data.products || [],
    chatId: chat._id
  };
}
