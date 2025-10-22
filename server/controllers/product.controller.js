import { createProductService, getProducts, deleteProduct} from "../services/product.service.js";
import { recommendProducts } from "../services/ai.service.js";

export async function createProduct(req,res){
    try{
        const result=await createProductService(req.body);
        res.json({result});
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
}

export async function getRecommendedProducts(req, res) {
  try {
    const { query } = req.body;
    const aiResult = await recommendProducts(query);

    res.json({
      success: true,
      intent: aiResult.intent,
      response: aiResult.response,
      products: aiResult.products || [],
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function searchProduct(req,res){
  try{
    const {page,size,category,priority}=req.body;
    const result=await getProducts(page,size,category,priority);

    res.json({
      success:true,
      result
    });
  }
  catch(error){
    console.log("Error: ",error);
    res.status(500).json({error:error.message});
  }
}

export async function deleteProductRequest(req,res){
  const {id}=req.params;
  if(deleteProduct(id)){
      res.json({
        success:true,
        message:"Product Deleted!"
      });
    }
    else{
      res.status(500).json({
        success:false,
        message:"Product Deletion Failed!"
      });
    }
}