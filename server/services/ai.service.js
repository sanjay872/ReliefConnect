import fetch from "node-fetch";
import {createNewTicket} from "../services/ticket.service.js";

const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_BASE_URL || "http://localhost:8001";

export async function recommendProducts(query,userId) {
    console.log(query)
  try {
    const response = await fetch(AI_SERVICE_BASE_URL+"/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({"query":query,"session_id":userId}),
    });
    const data = await response.json();
    console.log(data)
    return data;
  } catch (err) {
    console.error("AI Service error:", err.message);
    return { error: "AI service unavailable" };
  }
}

export async function issueReport(data_to_ai) {
  console.log(data_to_ai)
  try{
    const response=await fetch(AI_SERVICE_BASE_URL+"/report",{
      method:'POST',
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(data_to_ai),
    });

    const data=await response.json(); 
    console.log(data)

    // create ticket
    const newTicket={
      orderId:data_to_ai.order.id,
      userInput:"",
      orderProblem:data_to_ai.orderProblem,
      userId:data_to_ai.order.userId,
      aiResponse:data.polite_message,
      issueType:data_to_ai.issueType,
      status:"Open"
    }
    console.log(newTicket);
    const ticket=await createNewTicket(newTicket);   
    return data;
  } catch (err) {
    console.error("❌ Error in issueReport:", err.message);
    throw err;
  }
}