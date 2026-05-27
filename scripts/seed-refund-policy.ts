import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
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
  console.log("🌱 Seeding ONLY Return & Refund Policy Page to Supabase...");

  const slug = "return-refund-policy";
  const title = "Return & Refund Policy";
  const file = "return-refund-policy-sections.json";

  const seedDir = path.join(__dirname, "../prisma/seed");
  const pageData = JSON.parse(fs.readFileSync(path.join(seedDir, file), "utf-8"));

  const page = await prisma.page.upsert({
    where: { slug },
    update: { title, status: "PUBLISHED" },
    create: {
      title,
      slug,
      status: "PUBLISHED",
      seoData: {
        title: `TSV Global Solutions - ${title}`,
        description: `Expert return & refund policy details for global logistics needs.`
      },
    },
  });

  // Clear existing sections for this page only
  await prisma.pageSection.deleteMany({ where: { pageId: page.id } });

  // Add the sections
  for (const [index, [type, content]] of Object.entries(pageData).entries()) {
    await prisma.pageSection.create({
      data: {
        pageId: page.id,
        type,
        label: type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        order: index,
        content: content as any,
        isVisible: true,
      }
    });
  }

  console.log("🚀 Return & Refund Policy page seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding page:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
