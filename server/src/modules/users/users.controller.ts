import { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";

export async function meHandler(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      skills: true,
      rating: true,
      trustScore: true,
      experience: true,
      portfolio: true,
      walletBalance: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json(user);
}
