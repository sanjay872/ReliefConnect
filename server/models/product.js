import mongoose from "mongoose";
import {deleteProductFromChroma,updateSingleProductIntoChroma} from "../vector/realtimeSync.js";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "📦" },
    inStock: { type: Boolean, default: true },
    utility: { type: String },
    priority: { type: String, enum: ["preparedness", "urgent"], default: "preparedness" },
  },
  { timestamps: true });

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