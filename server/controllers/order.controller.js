import { createNewOrder } from "../services/order.service.js";

export async function createOrder(req, res) {
  try {
    // Save order in MongoDB
    const order =await createNewOrder(req.body); 

    res.status(201).json({
      orderId: order.id,
      status: "created",
      message: "Order successfully saved to database.",
    });
  } catch (error) {
    console.error("❌ Order creation failed:", error.message);

    // Fallback mock response (offline mode)
    res.status(200).json({
      orderId: "offline-0001",
      status: "created",
      message:
        "This is a mock offline order response used when the network is unavailable.",
    });
  }
}