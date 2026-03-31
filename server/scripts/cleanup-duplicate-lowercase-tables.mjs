import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const statements = [
  "DROP VIEW IF EXISTS freelancers",
  "DROP TABLE IF EXISTS validation_reports",
  "DROP TABLE IF EXISTS submissions",
  "DROP TABLE IF EXISTS messages",
  "DROP TABLE IF EXISTS transactions",
  "DROP TABLE IF EXISTS milestones",
  "DROP TABLE IF EXISTS projects",
  "DROP TABLE IF EXISTS users",
  "DROP TYPE IF EXISTS transaction_type",
  "DROP TYPE IF EXISTS work_type",
  "DROP TYPE IF EXISTS milestone_status",
  "DROP TYPE IF EXISTS project_status",
  "DROP TYPE IF EXISTS user_role",
];

for (const sql of statements) {
  await prisma.$executeRawUnsafe(sql);
  console.log(`OK: ${sql}`);
}

await prisma.$disconnect();
console.log("Cleanup complete. Prisma tables remain intact.");
