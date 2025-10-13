const mongoose=require('mongoose')
const {deleteProductFromChroma,updateSingleProductIntoChroma}=require("../vector/realtimeSync")

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  quantity: Number,
  updatedAt: { type: Date, default: Date.now }
});

productSchema.post("save",async function(doc){
    await updateSingleProductIntoChroma(doc);
});


productSchema.post("findOneAndUpdate",async function(doc){
    await updateSingleProductIntoChroma(doc);
});


productSchema.post("deleteOne", {document:true, query:false}, async function(doc){
    await deleteProductFromChroma(doc._id.toString());
});

export default mongoose.model("Product", productSchema);