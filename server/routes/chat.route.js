import express from "express";
import { chatWithBot, getChatHistory } from "../controllers/chat.controller.js";

const router = express.Router();
router.post("/", chatWithBot);
router.get("/:userId", getChatHistory);
export default router;