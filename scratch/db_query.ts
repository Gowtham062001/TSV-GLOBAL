import dotenv from "dotenv";
dotenv.config();

// Override DATABASE_URL with DIRECT_URL for direct connection
if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

import { prisma } from "../src/lib/db";

async function main() {
  const results = await prisma.$queryRawUnsafe(`
    SELECT id, type, label, content, "isVisible"
    FROM "ServiceSection"
    WHERE type LIKE '%header%'
       OR type LIKE '%breadcrumb%'
       OR type LIKE '%banner%'
       OR "order" = 0
    LIMIT 10;
  `);
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
