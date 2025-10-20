
import {createAccount,login} from "../services/user.service.js";

async function newAccount(req,res){
    const {fullname,email,password}=req.body;

    const id = await createAccount({
        fullname:fullname,
        email:email,
        password:password
    });

    res.json({id});
}

async function accountLogin(req,res) {
    const {email,password}=req.body;
    const user=await login({
        email:email,
        password:password
    });
    if(user){
        res.json({
            success:true,
            message:"Login Success!",
            id: user._id
        });
    }
    else{
        res.status(401).json({
            success:false,
            message:"Login failed!"
        })
    }
}

export{
    newAccount,
    accountLogin
}