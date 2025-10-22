import { Order } from "../models/order.js";

export async function createNewOrder(data){
    
    const {name,address,phone,email = "",urgency = "medium",payment,
      items,isPackage,timestamp} = data;

    const order=await Order.create({
      name,
      address,
      phone,
      email,
      urgency,
      payment,
      items,
      isPackage,
      timestamp,
    });
    
    return order;
}