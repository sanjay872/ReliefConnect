import {createNewTicket,getTicketsByUserId,updateTicketStatus} from "../services/ticket.service.js";

export async function createTicket(req,res){
    try{
        const ticket=await createNewTicket(req.body);
        res.json({ticket})
    }
    catch(e){
        console.log("Failed to create new Ticket",e);
        res.status(500).json({"msg":"Failed to create ticket"});
    }
}

export async function getTickets(req,res){
    try{
        const userId=req.params.id;
        const tickets=await getTicketsByUserId(userId);
        res.status(200).json({tickets});
    }
    catch(e){
        res.status(500).json({"msg":"Error in fetching tickets"});
    }
}

export async function updateTicketstatus(req,res){
    try{
        const updatedTicket=await updateTicketStatus(req.body);
        res.status(200).json({"msg":"Status Updated!",ticket:updatedTicket});
    }
    catch(e){
        res.status(500).json({"msg":"Error in fetching tickets"});
    }
}