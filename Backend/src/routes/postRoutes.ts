import { Router } from "express";
import * as postController from "../controllers/postController";
import authMiddleware from "../middleware/authMiddleware";
import multer from "multer";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB per file

// Accept multiple images and audio files via multipart/form-data
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "images", maxCount: 6 },
    { name: "audio", maxCount: 4 },
  ]),
  postController.createPost,
);
router.get("/", authMiddleware, postController.listPosts);
router.get("/:id", authMiddleware, postController.getPost);
router.post("/:id/like", authMiddleware, postController.toggleLike);
router.post("/:id/comment", authMiddleware, postController.addComment);

export default router;
