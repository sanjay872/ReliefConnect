import { Order } from "../models/order.js";
import {generateUserId} from "../utils/tool.js";


export async function createNewOrder(data){
    
    const {userId,name,address,phone,email = "",status,urgency = "medium",payment,
      items,isPackage,timestamp} = data;

    const orderId=generateUserId();

    const order=await Order.create({
      userId,
      orderId,
      name,
      address,
      phone,
      email,
      status,
      urgency,
      payment,
      items,
      isPackage,
      timestamp,
    });
    
    return order;
}

export async function getOrders(userId){
  const orders=Order.find((order)=>order.userId===userId);
  return orders;
}

export async function getOrder(orderId){
  return Order.findOne((order)=>order.orderId=orderId);
}

export async function updateOrderStatus(orderId,newStatus){
  Order.updateOne((order)=>order.orderId===orderId,{status:newStatus});
}

export async function getOrderDetails(){
  
}

export async function refundOrder(){

}