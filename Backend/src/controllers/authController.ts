import { Request, Response } from "express";
import * as authService from "../services/authService";

export const register = async (req: Request, res: Response) => {
  const body = req.body || {};
  const { username, email, password } = body;
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message:
        "Missing fields. Please send JSON with username, email, and password.",
    });
  }

  try {
    const { user, token } = await authService.registerUser(
      username,
      email,
      password,
    );

    const respUser = {
      id: user._id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    };

    return res.status(201).json({ success: true, user: respUser, token });
  } catch (err: any) {
    return res
      .status(400)
      .json({ success: false, message: err.message || "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  const body = req.body || {};
  const { email, password } = body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing fields. Please send JSON with email and password.",
    });
  }

  try {
    const { user, token } = await authService.loginUser(email, password);

    const respUser = {
      id: user._id,
      email: user.email,
      username: user.username,
    };

    return res.status(200).json({ success: true, user: respUser, token });
  } catch (err: any) {
    return res
      .status(401)
      .json({ success: false, message: err.message || "Login failed" });
  }
};
