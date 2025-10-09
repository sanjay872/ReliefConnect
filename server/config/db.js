
const mongoose=require('mongoose')

const dbConnection=async()=>{
    try{
        const con=await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connection Successful!");
    }
    catch(error){
        console.log("Database connection error!");
    }
}

module.exports = dbConnection