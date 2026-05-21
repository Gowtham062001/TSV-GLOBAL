import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "media@tsvhomes.in";
  const password = "TSVGlobal0415";

  console.log(`Checking DB for user: ${email}...`);

  const user = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`❌ User not found with email: ${email}`);
    return;
  }

  console.log(`Found user in DB:`, {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    role: user.role,
  });

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (isPasswordValid) {
    console.log(`✅ PASSWORD IS CORRECT! The password '${password}' matches the stored hash.`);
  } else {
    console.log(`❌ PASSWORD IS INCORRECT! The password '${password}' does NOT match the stored hash.`);
  }
}

main()
  .catch((e) => {
    console.error("Error occurred:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
