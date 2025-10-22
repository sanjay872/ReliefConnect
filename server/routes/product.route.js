import express from "express";
import { createProduct, getRecommendedProducts, searchProduct, deleteProductRequest } from "../controllers/product.controller.js";

const router = express.Router();

router.post("/",createProduct);
router.post("/search",searchProduct);
router.delete("/:id",deleteProductRequest);

// AI
router.post("/recommend",getRecommendedProducts);

export default router;