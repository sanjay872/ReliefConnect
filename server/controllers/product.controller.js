import { createProductService, handleProductSearchService } from "../services/product.service.js";

export const createProduct=async (req,res)=>{
    try{
        const {message}=req.body;
        const res=await createProductService(message);
        res.json({res});
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
}

export const getProducts=async (req,res)=>{
    try{
        const {message}=req.body;
        const res=await handleProductSearchService(message);
        res.json({res});
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
}