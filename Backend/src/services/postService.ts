import Post, { IComment } from "../models/postModel";
import { Types } from "mongoose";

export const createPost = async (
  userId: string,
  data: { text?: string | null; images?: string[]; audio?: string[] },
) => {
  const newPost = new Post({
    author: new Types.ObjectId(userId),
    text: data.text ?? null,
    images: data.images ?? [],
    audio: data.audio ?? [],
  });

  return await newPost.save();
};

export const getPosts = async (limit = 20, skip = 0) => {
  return await Post.find()
    .populate("author", "username email")
    .populate("comments.user", "username email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const getPostById = async (postId: string) => {
  return await Post.findById(postId)
    .populate("author", "username email")
    .populate("comments.user", "username email");
};

export const toggleLike = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) return null;

  const userObj = new Types.ObjectId(userId);
  const idx = post.likes.findIndex(
    (l: any) => l.equals?.(userObj) || String(l) === String(userObj),
  );

  if (idx === -1) {
    post.likes.push(userObj);
  } else {
    post.likes.splice(idx, 1);
  }

  return await post.save();
};

export const addComment = async (
  postId: string,
  userId: string,
  content: string,
) => {
  const comment: IComment = { user: new Types.ObjectId(userId), content };
  const post = await Post.findById(postId);
  if (!post) return null;

  post.comments.push(comment as any);
  return await post.save();
};
