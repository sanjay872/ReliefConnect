import User from '../models/user.js';
import {encryptPassword,isPasswordMatches} from '../utils/tool.js';

async function createAccount(account){
    const user= await User.create({
        fullname:account.fullname,
        email:account.email,
        password: await encryptPassword(account.password)
    });
    return user._id;
}

async function login(account) {
    const user =await User.findOne({email:account.email});
    if( user && await isPasswordMatches(account.password,user.password)){
        return user._id;
    }
}

export{
    createAccount,
    login
}