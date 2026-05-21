import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany();
  console.log("Existing slugs:", services.map(s => s.slug));
}

main().catch(console.error).finally(() => prisma.$disconnect());
