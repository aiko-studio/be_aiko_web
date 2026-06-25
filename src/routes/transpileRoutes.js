import express from "express";
import { handleTranspile } from "../controllers/transpileController.js";
import { handleAst } from "../controllers/astController.js";

const router = express.Router();


router.post("/transpile", handleTranspile);
router.get('/ast', (_, res) => res.json({status: "ok", message: "Ast Ready"}));
router.post("/ast", handleAst);


export default router;