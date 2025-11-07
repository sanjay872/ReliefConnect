import mongoose from "mongoose";

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
  status:{type:String, default:"processing"}, // Processing, Shipped, Out-for-Delivery, Delivered, Cancelled, Refunded  
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

export const Order = mongoose.model("Order", orderSchema);