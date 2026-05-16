import express from "express";
import { checkGrammar } from "../controllers/grammarController";

const router = express.Router();

router.post("/check", checkGrammar);

export default router;
