import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getEnv } from "./env.js";

export async function hashPassword(plain: string) {
  return await bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string) {
  return await bcrypt.compare(plain, hash);
}

export function signToken(userId: string) {
  const env = getEnv();
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  const env = getEnv();
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    return payload;
  } catch (err) {
    return null;
  }
}

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
