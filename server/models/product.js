import mongoose from "mongoose";
import {deleteProductFromChroma,updateSingleProductIntoChroma} from "../vector/realtimeSync.js";

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  quantity: Number,
  updatedAt: { type: Date, default: Date.now }
});

// SYNC with Chroma

productSchema.post("save",async function(doc){
    await updateSingleProductIntoChroma(doc);
});


productSchema.post("findOneAndUpdate",async function(doc){
    await updateSingleProductIntoChroma(doc);
});


productSchema.post("deleteOne", {document:true, query:false}, async function(doc){
    await deleteProductFromChroma(doc._id.toString());
});

const Product = mongoose.model("Product", productSchema);
export default Product;