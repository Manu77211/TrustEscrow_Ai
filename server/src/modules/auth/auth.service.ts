import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { signJwt } from "../../lib/jwt.js";
import { LoginInput, RegisterInput } from "./auth.schema.js";

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "FREELANCER";
  skills: string[];
  rating: number;
  trustScore: number;
  experience: string;
  portfolio: string[];
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    skills: user.skills,
    rating: user.rating,
    trustScore: user.trustScore,
    experience: user.experience,
    portfolio: user.portfolio,
  };
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("Email already in use");
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      skills: input.skills,
      experience: input.experience,
      portfolio: input.portfolio,
      rating: 0,
      trustScore: 50,
    },
  });

  const token = signJwt({ userId: user.id, role: user.role });
  return { token, user: toPublicUser(user) };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const passwordOk = await bcrypt.compare(input.password, user.password);
  if (!passwordOk) {
    throw new Error("Invalid credentials");
  }

  const token = signJwt({ userId: user.id, role: user.role });
  return { token, user: toPublicUser(user) };
}
