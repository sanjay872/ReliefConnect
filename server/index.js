import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import productRoutes from "./routes/product.route.js";
import dbConnection from "./config/db.js";
import chatRoutes from "./routes/chat.route.js";
import cartRoutes from "./routes/cart.route.js";

dotenv.config()
dbConnection()

const app=express()
const PORT= process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use("/api/products",productRoutes)
app.use("/api/chat", chatRoutes);
app.use("/api/cart",cartRoutes);

app.listen(PORT,()=>console.log(`Server is running at post ${PORT}`))