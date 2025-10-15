import {getProducts} from './chromaDB'
import OpenAI from "openai"

const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});

async function textEmbedding(data){
    const response = await openai.embeddings.create({
        model:"text-embedding-3-small",
        input:data
    });
    return response.data[0].embedding;
}

async function updateSingleProductIntoChroma(product){
    try{
        const chromaCollections=await getProducts();
        const embeddings = await textEmbedding(`Name:${product.name}, Description: ${product.description}, price:${product.price}, Quantity: ${product.quantity}`)
        await chromaCollections.upsert({
            ids:[product._id.toString()],
            embeddings:[embeddings],
            metadatas: [product.toObject()],
            documents: [`${product.name}:${product.description}`]  
        });
        console.log(`${product.name} is synced!`);
    }
    catch(error){
        console.log(`Product update failed in Chroma - ${error}`);
    }
}

async function deleteProductFromChroma(productId){
    try{
        const chromaCollections=await getProducts();
        await chromaCollections.delete({
            ids:[productId]
        });
        console.log(`Delete product with id ${productId}`);
    }
    catch(error){
        console.log(`Failed to delete product with id - ${productId}`);
    }
}

module.exports={
    updateSingleProductIntoChroma,
    deleteProductFromChroma
}