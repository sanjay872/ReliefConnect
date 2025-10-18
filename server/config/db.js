import mongoose from "mongoose";
const dbConnection=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connection Successful!");
    }
    catch(error){
        console.log("Database connection error!");
    }
}

export default dbConnection;