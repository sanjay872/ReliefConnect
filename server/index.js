import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import productRoutes from "./routes/product.route.js";
import dbConnection from "./config/db.js";

dotenv.config()
dbConnection()

const app=express()

app.use(cors())
app.use(express.json())
app.use("/api/product",productRoutes)

app.listen(PORT,()=>console.log(`Server is running at post ${PORT}`))