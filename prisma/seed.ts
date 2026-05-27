import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import * as bcrypt from "bcryptjs";
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
  console.log("🌱 Starting 100% Comprehensive Seeding (Robust Mode)...");
  
  // Cleanup old slugs
  await prisma.page.deleteMany({ where: { slug: "success-stories" } });

  // ── Database Schema Fix for Forgot Password ────────────────────────────────
  console.log("  - Ensuring PasswordResetToken table exists...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
      "id" TEXT NOT NULL,
      "token" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "used" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken"("token");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");`);
  // ─────────────────────────────────────────────────────────────────────────

  // 1. Seed Site Settings
  console.log("  - Seeding Site Settings...");
  const settingsData = JSON.parse(fs.readFileSync(path.join(__dirname, "seed/settings.json"), "utf-8"));
  for (const [key, value] of Object.entries(settingsData)) {
    const valStr = typeof value === "string" ? value : JSON.stringify(value);
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: valStr },
      create: { key, value: valStr, group: "GENERAL" },
    });
  }


  // 3. Seed Admin User
  console.log("  - Seeding Admin User...");
  const adminEmail = process.env.ADMIN_EMAIL || "media@tsvhomes.in";
  const adminPass = process.env.ADMIN_PASSWORD || "Admin@123";
  const hashedPassword = await bcrypt.hash(adminPass, 10);
  
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hashedPassword },
    create: {
      email: adminEmail,
      name: "Super Admin",
      passwordHash: hashedPassword,
      role: "ADMIN",
    }
  });

  // 4. Seed Pages & Sections
  const pagesToSeed = [
    { slug: "home", title: "Home", file: "home-sections.json" },
    { slug: "about", title: "About Us", file: "about-sections.json" },
    { slug: "contact", title: "Contact Us", file: "contact-sections.json" },
    { slug: "services", title: "Our Services", file: "services-sections.json" },
    { slug: "case-studies", title: "Case Studies", file: "case-studies-sections.json" },
    { slug: "blog", title: "Blog", file: "blog-sections.json" },
    { slug: "associations", title: "Associations", file: "associations-sections.json" },
    { slug: "careers", title: "Careers", file: "careers-sections.json" },
    { slug: "our-milestones", title: "Our Milestones", file: "our-milestones-sections.json" },
    { slug: "corporate-chronicles", title: "Corporate Chronicles", file: "corporate-chronicles-sections.json" },
    { slug: "privacy-policy", title: "Privacy Policy", file: "privacy-policy-sections.json" },
    { slug: "terms-and-conditions", title: "Terms & Conditions", file: "terms-sections.json" },
    { slug: "return-refund-policy", title: "Return & Refund Policy", file: "return-refund-policy-sections.json" },
  ];

  for (const pInfo of pagesToSeed) {
    console.log(`  - Seeding Page: ${pInfo.title}`);
    const pageData = JSON.parse(fs.readFileSync(path.join(__dirname, `seed/${pInfo.file}`), "utf-8"));
    const page = await prisma.page.upsert({
      where: { slug: pInfo.slug },
      update: { title: pInfo.title, status: "PUBLISHED" },
      create: {
        title: pInfo.title,
        slug: pInfo.slug,
        status: "PUBLISHED",
        seoData: { 
          title: `TSV Global Solutions - ${pInfo.title}`, 
          description: `Expert ${pInfo.title.toLowerCase()} for global logistics needs.` 
        },
      },
    });

    await prisma.pageSection.deleteMany({ where: { pageId: page.id } });
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
  }

  // 5. Seed Services
  console.log("  - Seeding Services...");
  const servicesData = JSON.parse(fs.readFileSync(path.join(__dirname, "seed/standardized-services.json"), "utf-8"));
  for (const s of servicesData) {
    const { sections, ...serviceData } = s;
    const service = await prisma.service.upsert({
      where: { slug: s.slug },
      update: serviceData,
      create: serviceData,
    });

    if (sections && sections.length > 0) {
      await prisma.serviceSection.deleteMany({ where: { serviceId: service.id } });
      for (const [idx, sec] of sections.entries()) {
        await prisma.serviceSection.create({
          data: {
            ...sec,
            order: sec.order !== undefined ? sec.order : idx,
            serviceId: service.id,
          }
        });
      }
    }
  }

  // 6. Seed Case Studies
  console.log("  - Seeding Case Studies...");
  const caseStudiesData = JSON.parse(fs.readFileSync(path.join(__dirname, "seed/case-studies.json"), "utf-8"));
  for (const cs of caseStudiesData) {
    await prisma.caseStudy.upsert({
      where: { slug: cs.slug },
      update: cs,
      create: cs,
    });
  }

  // 7. Seed Jobs
  console.log("  - Seeding Jobs...");
  const careersData = JSON.parse(fs.readFileSync(path.join(__dirname, "seed/careers-sections.json"), "utf-8"));
  if (careersData.job_openings && careersData.job_openings.jobs) {
    for (const job of careersData.job_openings.jobs) {
      await prisma.job.upsert({
        where: { id: job.title.toLowerCase().replace(/\s+/g, '-') }, // Using title as a temporary slug for seeding
        update: {
          title: job.title,
          type: job.type,
          location: job.location,
          experience: job.experience,
          description: job.description,
          icon: job.icon,
          link: job.link || null,
          isExpired: job.isExpired || false,
          status: "PUBLISHED",
        },
        create: {
          id: job.title.toLowerCase().replace(/\s+/g, '-'),
          title: job.title,
          type: job.type,
          location: job.location,
          experience: job.experience,
          description: job.description,
          icon: job.icon,
          link: job.link || null,
          isExpired: job.isExpired || false,
          status: "PUBLISHED",
        },
      });
    }
  }

  // 8. Seed Blog Posts
  console.log("  - Seeding Blog Posts...");
  const blogPostsData = JSON.parse(fs.readFileSync(path.join(__dirname, "seed/blog.json"), "utf-8"));
  for (const post of blogPostsData) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  // 8. Seed Gallery
  console.log("  - Seeding Gallery...");
  const galleryData = JSON.parse(fs.readFileSync(path.join(__dirname, "seed/gallery.json"), "utf-8"));
  await prisma.galleryImage.deleteMany({});
  for (const img of galleryData) {
    await prisma.galleryImage.create({ data: img });
  }

  // 9. Seed Menu Hierarchy
  console.log("  - Seeding Menu...");
  const menuData = JSON.parse(fs.readFileSync(path.join(__dirname, "seed/menus.json"), "utf-8"));
  await prisma.menuItem.deleteMany({});
  
  async function seedMenuItems(items: any[], parentId: string | null = null) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const created = await prisma.menuItem.create({
        data: {
          label: item.title,
          url: item.link,
          icon: item.icon || null,
          order: i,
          parentId: parentId,
        }
      });
      if (item.items && item.items.length > 0) {
        await seedMenuItems(item.items, created.id);
      }
    }
  }
  await seedMenuItems(menuData);

  console.log("🚀 100% Seeding completed successfully!");
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
