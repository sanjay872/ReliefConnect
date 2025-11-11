import Ticket from "../models/ticket.js";

async function createNewTicket(data){
    const newTicket={
        orderId:data.orderId,
        userInput:data.userInput,
        orderProblem:data.orderProblem,
        userId:data.userId,
        aiResponse:data.aiResponse,
        status:data.status
    }
    const createdTicket=await Ticket.create(newTicket);
    return createdTicket;
}

async function updateTicketStatus(data){
    const ticket=await Ticket.findOne({orderId:data.orderId});
    ticket.status=data.status;
    await ticket.save();
    return ticket;
}

async function getTicketsByUserId(userId){
    const tickets=await Ticket.find({userId:userId})
    if(tickets){
        return tickets
    }
    return []
}

export{
    createNewTicket,
    updateTicketStatus,
    getTicketsByUserId
}