import {addItem, getAllItems, deleteItem} from "../services/cart.service.js"; 

export async function addItemIntoCart(req,res){
    try{
        const {item,userId}=req.body;

        const createdItem=await addItem(userId,item);

        res.json({
            success:true,
            item:createdItem
        })
    }
    catch(error){
            res.status(500).json({"error":error})
    }
}

export async function getCartItems(req,res){
    const {userId}=req.params;
    const cart=await getAllItems(userId);
    if(cart){
        res.json({
        ...cart._doc
        });
    }
    else{
        res.json({})
    }
}

export async function deleteItemFromCart(req,res){
    const {userId, productId}=req.body;
    await deleteItem(userId,productId);

    res.status(200).json({
        success:true,
        message:"Item deleted!"
    });
}