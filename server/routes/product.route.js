import express from "express";
import { createProduct, getRecommendedProducts } from "../controllers/product.controller.js";

const router = express.Router();

router.post("/",createProduct);

// AI
router.get("/recommend",getRecommendedProducts);

export default router;