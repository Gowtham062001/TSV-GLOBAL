import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const serviceNames: Record<string, string> = {
  'road-freight':        'Road Freight',
  'sea-freight':         'Sea Freight / Ocean Freight',
  'air-freight':         'Air Freight',
  'solar-panel':         'Solar Panel Logistics',
  'project-management':  'Project Management',
  'oil-and-gas':         'Oil & Gas',
  'food-products':       'Food Products',
  'nvocc':               'NVOCC Services',
  'custom-clearance':    'Custom Clearance',
  'project-cargo':       'Project Cargo',
  'odc-cargo':           'ODC Cargo',
  'transportation':      'Transportation',
  'batteries':           'Batteries',
  'chemicals':           'Chemicals',
};

async function main() {
  console.log("Updating service titles...");
  
  for (const [slug, title] of Object.entries(serviceNames)) {
    try {
      const updated = await prisma.service.updateMany({
        where: { slug },
        data: { title }
      });
      console.log(`Updated ${slug} -> ${title} (${updated.count} records)`);
    } catch (err) {
      console.error(`Failed to update ${slug}:`, err);
    }
  }
  
  console.log("✅ Service titles update complete!");
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
