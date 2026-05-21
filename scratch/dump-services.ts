import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
const pool = new Pool({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== SERVICES IN DB ===");
  const services = await prisma.service.findMany({
    orderBy: { order: "asc" },
    include: { parent: true }
  });
  console.log(JSON.stringify(services.map(s => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    parentId: s.parentId,
    parentSlug: s.parent?.slug,
    isVisible: s.isVisible,
    status: s.status,
    order: s.order
  })), null, 2));

  console.log("=== PAGES IN DB ===");
  const pages = await prisma.page.findMany({
    orderBy: { title: "asc" }
  });
  console.log(JSON.stringify(pages.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    isVisible: p.isVisible,
    status: p.status
  })), null, 2));
  
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
