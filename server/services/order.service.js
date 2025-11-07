import { Order } from "../models/order.js";

export async function createNewOrder(data){
    
    const {userId,name,address,phone,email = "",status,urgency = "medium",payment,
      items,isPackage,timestamp} = data;

    const order=await Order.create({
      userId,
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
  const orders=await Order.find({userId:userId});
  return orders;
}

export async function getOrder(orderId){
  const order= await Order.findOne({_id:orderId})
  console.log(order);
  return order;
} 

export async function updateOrderStatus(orderId,newStatus){
  await Order.updateOne((order)=>order.orderId===orderId,{status:newStatus});
}

export async function getOrderDetails(){
  
}

export async function refundOrder(){

}