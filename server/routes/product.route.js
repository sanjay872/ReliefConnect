import express from "express";
import { createProduct, getRecommendedProducts, searchProduct, deleteProductRequest } from "../controllers/product.controller.js";

const router = express.Router();

router.post("/",createProduct);
router.get("/search",searchProduct);
router.delete("/:id",deleteProductRequest);

// AI
router.get("/recommend",getRecommendedProducts);

export default router;