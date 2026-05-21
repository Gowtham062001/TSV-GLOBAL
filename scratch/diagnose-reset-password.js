const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 4000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== DIAGNOSING PASSWORD RESET TOKENS ===");
  
  const tokens = await prisma.passwordResetToken.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  console.log(`Found ${tokens.length} reset tokens.`);
  for (const t of tokens) {
    const user = await prisma.adminUser.findUnique({
      where: { id: t.userId },
      select: { email: true, name: true }
    });
    console.log(`Token: ${t.token}`);
    console.log(`  User: ${user ? user.email : 'Unknown'} (${user ? user.name : 'N/A'})`);
    console.log(`  Created At: ${t.createdAt}`);
    console.log(`  Expires At: ${t.expiresAt}`);
    console.log(`  Used: ${t.used}`);
    console.log(`  Is Expired: ${t.expiresAt < new Date()}`);
    console.log(`----------------------------------------`);
  }
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
