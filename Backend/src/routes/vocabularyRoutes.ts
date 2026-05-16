import express from "express";
import * as vocabularyController from "../controllers/vocabularyController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware);

// API: POST /api/vocabulary/add
router.post("/add", vocabularyController.addWord);

// API mới: GET /api/vocabulary/all
router.get("/all", vocabularyController.getWords);

// Route mới: DELETE /api/vocabulary/:id
router.delete("/:id", vocabularyController.removeWord);

export default router;
