// Mock chat history for ChatModal
export const mockChatHistory = [
  {
    id: 1,
    type: "ai",
    message:
      "Hello! I'm your virtual customer service agent. How can I help you today?",
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: 2,
    type: "user",
    message: "I need to check my order status",
    timestamp: new Date(Date.now() - 3300000),
  },
  {
    id: 3,
    type: "ai",
    message:
      "I'd be happy to help you check your order status. Could you please provide your order ID?",
    timestamp: new Date(Date.now() - 3000000),
  },
];
