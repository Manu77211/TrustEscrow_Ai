import dotenv from "dotenv";

dotenv.config();

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: getEnv("DATABASE_URL"),
  DIRECT_URL: getEnv("DIRECT_URL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
};
