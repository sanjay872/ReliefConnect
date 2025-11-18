import mongoose from "mongoose";

const ticketSchema=new mongoose.Schema({
    orderId:{type:String, required:true},
    userInput:{type:String},
    orderProblem:{type:String,required:true},
    issueType:{type:String,required:true},
    userId:{type:String, required:true},
    aiResponse:{type:String, required:true},
    status:{type:String, default:"open"}, // requested review, closed
    timestamp: { type: Date, default: Date.now },
});

const Ticket=mongoose.model('Ticket',ticketSchema);
export default Ticket;