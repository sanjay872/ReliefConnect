import bcrypt from "bcrypt"

const saltRound=process.env.SALT_ROUND || 10;
const userid_length=process.env.USERID_LENGTH || 8;
const characters="abcdefghijklmnopqrestuvwxyzABCDEFGHIJKLMNOPQRESTUVWXYZ0123456789";

async function encryptPassword(password){
    try{
        const hash=await bcrypt.hash(password,saltRound);
        return hash;
    }
    catch(error){
        console.log("Password Encryption Error: ",error);
    }
}

async function isPasswordMatches(receivedPassword, encryptPassword) {
    try{
        const isMatch=await bcrypt.compare(receivedPassword,encryptPassword);
        return isMatch;
    }
    catch(error){
        console.log("Login Error", error);
    }
}

async function generateUserId(){
    let userId="";
    for(let i=0;i<userid_length;i++){
        userId+=characters.charAt(Math.floor(Math.random()*characters.length));
    }
    return userId;
}

export{
    encryptPassword,
    isPasswordMatches,
    generateUserId
}