import { createNewOrder, getOrders, getOrder} from "../services/order.service.js";
import {issueReport} from "../services/ai.service.js";


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

// orders/:id
export async function getOrdersAPI(req,res){
  const id=req.params.id;
  try{
    const order=await getOrders(id);
    res.status(200).json(order);
  }
  catch{
    print("Error Fetching orders!");
  }
}

export async function getOrderAPI(req,res) {
  const id=req.params.id;
  console.log(id);
  
  try{
    const order=await getOrder(id);
    res.status(200).json(order);
  }
  catch{
    console.log("Error Fetching order!");
    res.status(500).json({"msg":"Order doesn't exist!"});
  }

}

export async function issueReportWithAI(req, res) {
  try {
    const data = req.body;

    // Validate required fields
    if (!data.order || !data.order_problem || !data.issue_type) {
      return res.status(400).json({ msg: "Missing required fields." });
    }

    const data_to_ai = {
      order: data.order,
      order_problem: data.order_problem,
      issue_type: data.issue_type,
      image: data.image ? data.image : null  // Base64 string or null
    };

    console.log("📨 Data going to FastAPI:", data_to_ai);

    const axiosResponse = await issueReport(data_to_ai); 
   
    res.status(200).json({
      ...axiosResponse
    });

  } catch (e) {
    console.error("❌ Error reporting issue:", e.message);
    res.status(500).json({
      msg: "Internal server error while reporting issue."
    });
  }
}

