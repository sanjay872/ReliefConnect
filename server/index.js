const express=require('express')
const dotenv=require('dotenv')
const cors=require('cors')

dotenv.config()

const app=express()

app.use(cors())
app.use(express.json())

const dbConnection=require('./config/db')
dbConnection()

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`Server is running at post ${PORT}`))