import Product from "../models/product.js";

async function createProductService(product){
    //console.log(product);
    const createdProduct=Product.create({
        name:product.name,
        description:product.description,
        category: product.category,
        quantity:product.quantity
    }); 
    return createdProduct;
}

async function getProducts(page,size,key){
    const skip = (page - 1) * size;
    let products;

    let query = {};

    if (key && key.trim() !== "") {
        query = {
        $or: [
            { name: { $regex: key, $options: "i" } },
            { description: { $regex: key, $options: "i" } }
        ]
        };
    }

    products = await Product.find(query)
        .skip(skip)
        .limit(size)
        .sort({ createdAt: -1 });

    const totalDocuments = await Product.countDocuments(query);

    return {
        totalSize: totalDocuments,
        totalPage: Math.ceil(totalDocuments / size),
        currentPage: page,
        products,
    };
}

async function deleteProduct(id){
    try{
        await Product.deleteOne({_id:id});
        return true;
    }
    catch(error){
        return false;
    }
}

export{
    createProductService,
    getProducts,
    deleteProduct,

};