//import ChatHistory from "../models/chat.js";
import fetch from "node-fetch";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001/recommend";
//const SUMMARY_URL = process.env.SUMMARY_URL || "http://localhost:8001/summarize";

// export async function getOrCreateChat(userId) {
//   let chat = await ChatHistory.findOne({ userId });
//   if (!chat) chat = await ChatHistory.create({ userId, messages: [] });
//   return chat;
// }

// async function summarizeChat(messages) {
//   try {
//     const text = messages.map(m => `${m.sender}: ${m.text}`).join("\n");
//     const response = await fetch(SUMMARY_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ text })
//     });
//     const data = await response.json();
//     return data.summary || "";
//   } catch (err) {
//     console.error("Summary failed:", err.message);
//     return "";
//   }
// }

export async function sendMessageToAI(userId, userMessage) {
  // const chat = await getOrCreateChat(userId);

  // if (chat.messages.length > 20) {
  //   const oldMessages = chat.messages.slice(0, 15); // summarize first 15
  //   const summary = await summarizeChat(oldMessages);

  //   chat.messages = [
  //     { sender: "bot", text: `Summary of previous conversation: ${summary}` },
  //     ...chat.messages.slice(15)
  //   ];
  //   await chat.save();
  // }

  // const context = chat.messages.map(m => `${m.sender}: ${m.text}`).join("\n");

 // const payload = { query: `${context}\nuser: ${userMessage}` };
  const response = await fetch(AI_SERVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({"session_id":userId,"query":userMessage})
  });
  const data = await response.json();

  // chat.messages.push({ sender: "user", text: userMessage });
  // chat.messages.push({ sender: "bot", text: data.response || "No response available." });
  // await chat.save();
  console.log(data)
  return {
    intent: data.intent || "product",
    response: data.response,
    products: data.products || [],
  };
}
