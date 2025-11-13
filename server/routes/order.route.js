import express from 'express'
import { createOrder, getOrdersAPI, getOrderAPI,issueReportWithAI } from '../controllers/order.controller.js';

const router = express.Router();

router.post("/", createOrder);
router.get("/all/:id",getOrdersAPI);
router.get("/:id",getOrderAPI);
router.post("/report",issueReportWithAI);

export default router;