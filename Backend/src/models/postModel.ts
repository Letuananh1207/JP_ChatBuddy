import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment {
  user: Types.ObjectId | string;
  content: string;
  createdAt?: Date;
}

export interface IPost extends Document {
  author: Types.ObjectId | string;
  text?: string | null;
  images: string[];
  audio: string[];
  likes: Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const PostSchema: Schema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: null },
    images: { type: [String], default: [] },
    audio: { type: [String], default: [] },
    likes: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    comments: { type: [CommentSchema], default: [] },
  },
  { timestamps: true },
);

PostSchema.index({ createdAt: -1 });

export default mongoose.models.Post ||
  mongoose.model<IPost>("Post", PostSchema);
