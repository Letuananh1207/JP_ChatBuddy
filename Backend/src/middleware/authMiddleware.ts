import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

export default function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "No token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET as string);
    req.user = payload as { id: string };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}
