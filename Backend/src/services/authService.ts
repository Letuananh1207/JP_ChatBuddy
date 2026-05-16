import User, { IUser } from "../models/userModel";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function registerUser(
  username: string,
  email: string,
  password: string,
) {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already registered");

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = await User.create({ username, email, password: hashed });

  const token = generateToken(user);
  return { user, token };
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = generateToken(user);
  return { user, token };
}

export function generateToken(user: IUser) {
  const secret = JWT_SECRET as jwt.Secret;
  return jwt.sign(
    { id: user._id.toString(), email: user.email, username: user.username },
    secret,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
