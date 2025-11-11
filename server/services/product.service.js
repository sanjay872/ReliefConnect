import Product from "../models/product.js";

async function createProductService(product){
    //console.log(product);
    const createdProduct= await Product.create(product); 
    return createdProduct;
}

async function getProducts(page,size,category,priority){
    const skip = (page - 1) * size;
    let products;

    let query = {};

    if (priority && priority.trim()!=="") {
        if(category!=="All"){
            query = {
                $and: [
                    {priority: { $regex: priority} },
                    {category: {$regex: category}}
                ]
            };
        }
        else{
            query = {
                priority: {$regex: priority}
            };
        }
    }

    products = await Product.find(query)
        .skip(skip)
        .limit(size)
        .sort({ createdAt: -1 });

    const totalDocuments = await Product.countDocuments(query);

    const formatted = products.map(p => ({
        id: p._id.toString(),   // ✅ rename _id → id
        ...p.toObject(),
        _id: undefined          // optional: remove the original field
    }));

    return {
        totalSize: totalDocuments,
        totalPage: Math.ceil(totalDocuments / size),
        currentPage: page,
        products:formatted,
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