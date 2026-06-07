import { Router } from "express";
import * as arenaController from "../controllers/arenaController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post("/rooms", authMiddleware, arenaController.createRoom);
router.post("/rooms/:code/join", authMiddleware, arenaController.joinRoom);
router.post("/rooms/:code/leave", authMiddleware, arenaController.leaveRoom);
router.get("/rooms/:code", authMiddleware, arenaController.getRoom);
router.post("/rooms/:code/ready", authMiddleware, arenaController.setReady);
router.post(
  "/rooms/:code/answer",
  authMiddleware,
  arenaController.submitAnswer,
);
router.get("/rooms/:code/ranking", authMiddleware, arenaController.getRanking);

export default router;
