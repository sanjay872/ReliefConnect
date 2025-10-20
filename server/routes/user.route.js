import express from "express"
import {accountLogin,newAccount} from "../controllers/user.controller.js"

const router=express.Router();

router.post("/signup",newAccount);
router.post("/login",accountLogin)

export default router;