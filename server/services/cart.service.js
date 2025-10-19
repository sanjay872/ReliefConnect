import Cart from "../models/cart.js";

async function addItem(userId,item){
    let cart=await Cart.findOne({userId});
    console.log(cart);
    if(!cart){
        cart= await Cart.create({
            userId:userId,
            products:[{"productId":item.productId, "quantity":item.quantity}]
        });
    }
    else{
        let existItemIndex = cart.products.findIndex(
            (i)=>i.productId.toString()===item.productId
        )
        if(existItemIndex>=0){
            cart.products[existItemIndex].quantity=item.quantity
        }
        else{
            cart.products.push({productId:item.productId,quantity:item.quantity});
        }
    }
    await cart.save();
    return cart;
}

async function getAllItems(userId){
    const userCart=await Cart.findOne({userId});
    return userCart;
}

async function deleteItem(userId, productId){
    const cart=await Cart.findOneAndUpdate(
        {userId}, // filter
        {$pull: {products:{productId}}},
        {new:true}
    )
    return cart;
}

export{
    addItem,
    getAllItems,
    deleteItem
}