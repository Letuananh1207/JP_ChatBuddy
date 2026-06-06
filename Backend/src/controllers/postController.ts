import { Request, Response } from "express";
import * as postService from "../services/postService";
import { uploadBuffer } from "../utils/cloudinary";
import { Express } from "express";

interface AuthRequest extends Request {
  user?: { id: string };
  files?: any;
}

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { text } = req.body;

    // DEBUG: dump files for troubleshooting
    console.log("[POST DEBUG] req.files:", req.files);

    // Handle multipart files (multer memory storage)
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    const imageFiles = files?.images || [];
    const audioFiles = files?.audio || [];

    const imageUrls: string[] = [];
    const audioUrls: string[] = [];

    for (const f of imageFiles) {
      try {
        const url = await uploadBuffer(f.buffer, { folder: "posts/images" });
        imageUrls.push(url);
      } catch (err) {
        console.error("Image upload error:", err);
      }
    }

    for (const f of audioFiles) {
      try {
        const url = await uploadBuffer(f.buffer, { folder: "posts/audio" });
        audioUrls.push(url);
      } catch (err) {
        console.error("Audio upload error:", err);
      }
    }

    const post = await postService.createPost(userId, {
      text,
      images: imageUrls,
      audio: audioUrls,
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error creating post", error });
  }
};

export const listPosts = async (req: AuthRequest, res: Response) => {
  try {
    const limit = Number(req.query.limit || 20);
    const page = Math.max(0, Number(req.query.page || 0));
    const skip = page * limit;

    const posts = await postService.getPosts(limit, skip);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
};

export const getPost = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    if (!postId) return res.status(400).json({ message: "Post ID required" });
    const post = await postService.getPostById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error });
  }
};

export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const postId = req.params.id;
    if (!postId) return res.status(400).json({ message: "Post ID required" });
    const updated = await postService.toggleLike(postId, userId);
    if (!updated) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error toggling like", error });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const postId = req.params.id;
    if (!postId) return res.status(400).json({ message: "Post ID required" });
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content required" });

    const updated = await postService.addComment(postId, userId, content);
    if (!updated) return res.status(404).json({ message: "Post not found" });
    res.status(201).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error });
  }
};
