import Product from "../models/product.js";

async function createProductService(product){
    console.log(product);
    const createdProduct=Product.create({
        name:product.name,
        description:product.description,
        category: product.category,
        quantity:product.quantity
    }); 
    return createdProduct;
}

export{
    createProductService
};