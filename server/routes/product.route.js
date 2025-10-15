import express from "express";
import { createProduct, getProducts } from "../controllers/product.controller.js";

export default productRoutes = express.Router();
productRoutes.post("/",createProduct);
productRoutes.get("/",getProducts);