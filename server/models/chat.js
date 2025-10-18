import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "bot"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ChatHistory", chatSchema);
