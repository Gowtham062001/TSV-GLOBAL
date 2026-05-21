const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const contactLeads = await prisma.contactSubmission.findMany({
    where: { email: 'test@example.com' }
  });
  console.log('--- Contact Leads ---');
  console.log(contactLeads);

  const brochureLeads = await prisma.brochureDownload.findMany({
    where: { email: 'brochure@example.com' }
  });
  console.log('--- Brochure Leads ---');
  console.log(brochureLeads);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
