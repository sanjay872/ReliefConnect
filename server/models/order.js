import mongoose from "mongoose";
import {deleteOrderFromChroma,updateSingleOrderIntoChroma} from "../vector/realtimeOrderSync.js";

const paymentSchema = new mongoose.Schema({
  method: { type: String },
  transactionId: { type: String },
  amount:{type: Number}, 
  currency:{type: String, default:"USD"},
  paid: {type: Boolean}
});

const orderSchema = new mongoose.Schema({
  userId:{type:String,required:true},
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  status:{type:String, default:"processing"}, // Processing, Shipped, Out-for-Delivery, Delivered, Cancelled, Refunded, in-review
  urgency: { type: String, default: "medium" },
  payment: paymentSchema,
  items: { type: Array, default: [] },
  isPackage: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
orderSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  },
});

// // SYNC with Chroma
// orderSchema.post("save",async function(doc){
//     await updateSingleOrderIntoChroma(doc);
// });


// orderSchema.post("findOneAndUpdate",async function(doc){
//     await updateSingleOrderIntoChroma(doc);
// });


// orderSchema.post("deleteOne", {document:true, query:false}, async function(doc){
//     await deleteOrderFromChroma(doc._id.toString());
// });

export const Order = mongoose.model("Order", orderSchema);