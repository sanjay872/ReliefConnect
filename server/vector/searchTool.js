import { OpenAI } from "openai";
import { getProducts } from "./chromaDB";

const openai = OpenAI({apiKey:process.env.OPENAI_API_KEY})

async function embedQuery(text){
    const res=openai.embeddings.create({
        model:"text-embedding-3-small",
        input:text
    });
    return res.data[0].embedding;
}


async function searchProductsVector(query){
    const collection=await getProducts();
    const queryEmbed=embedQuery(query);

    const res=await collection.query({
        queryEmbeddings:[queryEmbed],
        nResults:5
    });

    if(!res.metadatas?.[0]) return[];

    return results.metadatas[0].map((p)=>({
        id:p._id,
        name:p.name,
        description:p.description,
        category:p.category,
        quantity:p.quantity
    }));
}
