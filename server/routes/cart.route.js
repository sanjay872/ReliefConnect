import { Router } from "express"
import { addItemIntoCart,getCartItems,deleteItemFromCart } from "../controllers/cart.controller.js";

const router= Router();

router.post("/",addItemIntoCart);
router.get("/:userId",getCartItems);
router.delete("/",deleteItemFromCart);

export default router;