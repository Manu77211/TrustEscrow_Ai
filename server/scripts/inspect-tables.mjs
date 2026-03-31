import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rows = await prisma.$queryRawUnsafe(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
);

console.log(rows);

await prisma.$disconnect();
