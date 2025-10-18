import { createProductService} from "../services/product.service.js";
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