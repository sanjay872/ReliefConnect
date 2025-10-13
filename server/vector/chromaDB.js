import {ChromaClient} from "chromadb";

const client=new ChromaClient({
    path:"./chroma"
})

export const getProducts = async()=>{
    const products= await client.getOrCreateCollection(
        {
            name:"relief_products",
            metadata:{description:"Disaster relief products"}
        }
    )
    return products;
}