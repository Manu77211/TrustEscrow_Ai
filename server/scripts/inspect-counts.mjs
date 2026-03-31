import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rows = await prisma.$queryRawUnsafe(`
  SELECT '"User"' AS table_name, COUNT(*)::int AS count FROM "User"
  UNION ALL
  SELECT 'users', COUNT(*)::int FROM users
  UNION ALL
  SELECT '"Project"', COUNT(*)::int FROM "Project"
  UNION ALL
  SELECT 'projects', COUNT(*)::int FROM projects
  UNION ALL
  SELECT '"Milestone"', COUNT(*)::int FROM "Milestone"
  UNION ALL
  SELECT 'milestones', COUNT(*)::int FROM milestones
`);

console.table(rows);

await prisma.$disconnect();
