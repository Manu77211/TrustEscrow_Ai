import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signJwt(payload: { userId: string; role: string }) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
}
