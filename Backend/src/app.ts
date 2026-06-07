import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import connectDB from "./utils/db";
import vocabularyRoutes from "./routes/vocabularyRoutes";
import chatRoutes from "./routes/chatRoutes";
import grammarRoutes from "./routes/grammarRoutes";
import authRoutes from "./routes/authRoutes";
import messageDayRoutes from "./routes/mesageDayRoutes";
import postRoutes from "./routes/postRoutes";
import arenaRoutes from "./routes/arenaRoutes";
const app: Application = express();

// --- 1. Kết nối Database ---
connectDB();

// --- 2. Middlewares ---
app.use(cors());
// Giới hạn dung lượng payload để tránh tấn công DOS
// Tăng giới hạn payload để hỗ trợ image/audio data (nếu gửi base64)
app.use(bodyParser.json({ limit: "5mb" }));

// Cấu hình giới hạn số lượng request
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 60, // tối đa 60 requests/phút
  message: "Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút.",
});
app.use(limiter);

// --- 3. Routes ---

// Health check endpoint (để kiểm tra nhanh server sống hay chết)
app.get("/health", (req, res) => {
  res.status(200).send("API is running...");
});

// Gắn các route chức năng
app.use("/api/vocabulary", vocabularyRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/grammar", grammarRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/message-day", messageDayRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/arena", arenaRoutes);

export default app;
