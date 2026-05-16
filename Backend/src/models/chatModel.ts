import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  user?: Types.ObjectId | string;
  messages: IMessage[];
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: false },
  messages: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

// CẬP NHẬT TẠI ĐÂY:
// Kiểm tra trong mongoose.models xem 'Conversation' đã được đăng ký chưa.
// Nếu rồi thì dùng lại, nếu chưa mới tạo mới (compile).
export default mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ChatSchema);
