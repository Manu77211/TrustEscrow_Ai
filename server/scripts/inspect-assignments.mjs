import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rows = await prisma.$queryRawUnsafe(`
  SELECT
    p.id,
    p.title,
    p."status",
    p."clientId",
    cu.name AS client_name,
    p."freelancerId",
    fu.name AS freelancer_name,
    p."assignedAt",
    p."createdAt",
    p."updatedAt"
  FROM "Project" p
  LEFT JOIN "User" cu ON cu.id = p."clientId"
  LEFT JOIN "User" fu ON fu.id = p."freelancerId"
  ORDER BY p."updatedAt" DESC
  LIMIT 25;
`);

console.table(rows);

await prisma.$disconnect();
