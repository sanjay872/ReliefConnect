import { sendMessageToAI} from "../services/chat.service.js";
import ChatHistory from "../models/chat.js";

export async function chatWithBot(req, res) {
  try {
    const { message, userId } = req.body;
    if (!message || !userId) {
      return res.status(400).json({ error: "message and userId are required" });
    }

    const result = await sendMessageToAI(userId, message);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function getChatHistory(req, res) {
  try {
    const { userId } = req.params;
    const chat = await ChatHistory.findOne({ userId });
    if (!chat) return res.json({ success: true, messages: [] });
    res.json({ success: true, messages: chat.messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}