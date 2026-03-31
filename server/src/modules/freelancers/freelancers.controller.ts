import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export async function listFreelancersHandler(req: Request, res: Response) {
  const skillsQuery = (req.query.skills as string | undefined)?.trim();
  const ratingQuery = req.query.rating as string | undefined;
  const minRating = ratingQuery ? Number(ratingQuery) : undefined;

  const skills = skillsQuery
    ? skillsQuery
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const freelancers = await prisma.user.findMany({
    where: {
      role: "FREELANCER",
      ...(typeof minRating === "number" && !Number.isNaN(minRating)
        ? { rating: { gte: minRating } }
        : {}),
      ...(skills.length > 0 ? { skills: { hasEvery: skills } } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      skills: true,
      rating: true,
      trustScore: true,
      experience: true,
      portfolio: true,
    },
    orderBy: [{ trustScore: "desc" }, { rating: "desc" }],
  });

  return res.status(200).json(freelancers);
}
