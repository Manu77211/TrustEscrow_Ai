import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../lib/jwt.js";

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    role: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.slice(7);
  try {
    const payload = verifyJwt(token);
    req.auth = { userId: payload.userId, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
