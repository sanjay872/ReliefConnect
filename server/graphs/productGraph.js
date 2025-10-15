
import {ChatOpenAI} from "@langchain/openai";
import {StateGraph, ToolNode} from "@langchain/langgraph";
import {searchProductsVector} from "../vector/searchTool";

const llm =new ChatOpenAI({
    model:"gpt-4o-mini",
    temperature:0,
    apiKey:process.env.OPENAI_API_KEY
})

async function classificationNode(state) {
    const query=state.query;

    const res=await llm.invoke(
       `You are an intent classifier. Categorize the user's message into one of: 
     [product, order, other].
     Message: "${query}"
     Respond with only the label.`
    );

    return {...state,intent:res.content.trim().toLowerCase()}
}

async function responseNode(state){

    if(state.intent==="product"){
        return {response:state.results || "No Matching products found!"};
    }

    if(state.intent==="order"){
        return {response:"It seems like a order-related query, please check the order tracker"};
    }

    return { response: "I can help with disaster relief services or order inquiries. Please specify your request." };
}

async function vectorSearch(){
    return new ToolNode({
        name:"vector_product_search",
        description:"Search for disaster relief products from Chroma",
        func: async (query)=> await searchProductsVector(query)
    })
}

const productSearchGraph = new StateGraph()
.addNode("classificationNode",classificationNode)
.addNode("vectorSearch",vectorSearch)
.addNode("response",responseNode)
.addEdge("classificationNode",(state)=>{
    state.intent ==="product"? "vectorSearch": "response"
})
.addEdge("vectorSearch","response")
.compile();

module.exports = productSearchGraph