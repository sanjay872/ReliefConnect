import mongoose from "mongoose";

const cartItemSchema=new mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
    },
    quantity:{
        type: Number,
        required:true,
        min:1,
        default:1
    }
});

const cartSchema=new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    products:[cartItemSchema],
    
},{timestamps:true}) 

export default mongoose.model("Cart",cartSchema);