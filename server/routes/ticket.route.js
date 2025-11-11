import express from "express"
import {createTicket,updateTicketstatus,getTickets} from "../controllers/ticket.controller.js";

const router=express.Router()

router.post("/",createTicket);
router.get("/:id",getTickets);
router.put("/",updateTicketstatus);

export default router;