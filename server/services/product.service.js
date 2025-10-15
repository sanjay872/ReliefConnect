const Product =require("../models/product");
const productSearchGraph=require("../graphs/productGraph");

async function createProductService(product){
    const createdProduct=Product.create({
        name:product.name,
        description:product.description,
        category: product.category,
        quantity:product.quantity
    }); 
    return createdProduct;
}

async function handleProductSearchService(query){
    const res=await productSearchGraph.invoke({query});
    return res.response;
}

module.exports={
    createProductService,
    handleProductSearchService
};