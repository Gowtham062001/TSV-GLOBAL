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
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Setting up admin user: ${email}...`);

  const user = await prisma.adminUser.upsert({
    where: { email },
    update: {
      passwordHash: hashedPassword,
      isActive: true,
      role: "ADMIN",
    },
    create: {
      email,
      name: "Media Admin",
      passwordHash: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("✅ Admin user setup complete!");
  console.log("User details:", { id: user.id, email: user.email, isActive: user.isActive, role: user.role });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
