import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

export async function GET() {
  const log: string[] = [];
  try {
    log.push("Checking current database state...");
    
    // 1. Fetch initial counts to determine if we need to seed
    const pageCount = await prisma.page.count();
    const serviceCount = await prisma.service.count();
    const adminCount = await prisma.adminUser.count();
    
    log.push(`Found: ${pageCount} pages, ${serviceCount} services, ${adminCount} admin users.`);

    // 2. Securely upsert admin accounts
    log.push("Upserting administrative users...");
    const testEmail = "notification@tsvglobal.com";
    const testPass = "Admin@123";
    const hashedPassword = await bcrypt.hash(testPass, 10);

    await prisma.adminUser.upsert({
      where: { email: testEmail },
      update: {
        passwordHash: hashedPassword,
        isActive: true,
        role: "ADMIN"
      },
      create: {
        name: "Super Admin",
        email: testEmail,
        passwordHash: hashedPassword,
        role: "ADMIN",
        isActive: true
      }
    });

    const mediaEmail = "media@tsvhomes.in";
    const mediaPass = "TSVGlobal0415";
    const mediaHash = await bcrypt.hash(mediaPass, 10);

    await prisma.adminUser.upsert({
      where: { email: mediaEmail },
      update: {
        passwordHash: mediaHash,
        isActive: true,
        role: "SUPER_ADMIN"
      },
      create: {
        name: "Super Admin Legacy",
        email: mediaEmail,
        passwordHash: mediaHash,
        role: "SUPER_ADMIN",
        isActive: true
      }
    });
    log.push("Admin accounts successfully synced.");

    // 3. Full Database Seed (if empty)
    if (pageCount === 0 || serviceCount === 0) {
      log.push("Database is empty or missing data. Starting automatic full seed...");
      
      const seedDir = path.join(process.cwd(), "prisma", "seed");
      
      // Ensure Reset Token Table exists
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

      // A. Seed Site Settings
      log.push("Seeding Site Settings...");
      const settingsData = JSON.parse(fs.readFileSync(path.join(seedDir, "settings.json"), "utf-8"));
      for (const [key, value] of Object.entries(settingsData)) {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value: value as any },
          create: { key, value: value as any, group: "GENERAL" },
        });
      }

      // B. Seed Global SEO
      log.push("Seeding SEO...");
      await prisma.siteSetting.upsert({
        where: { key: "seo_title_template" },
        update: {},
        create: { key: "seo_title_template", value: "%s | TSV Global Solutions", group: "GENERAL" }
      });
      await prisma.siteSetting.upsert({
        where: { key: "seo_meta_description" },
        update: {},
        create: { key: "seo_meta_description", value: "Global NVOCC and freight forwarding experts specialized in ODC, Project Cargo, and end-to-end logistics.", group: "GENERAL" }
      });

      // C. Seed Pages & Sections
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
      ];

      for (const pInfo of pagesToSeed) {
        log.push(`Seeding Page: ${pInfo.title} (${pInfo.slug})...`);
        const pageData = JSON.parse(fs.readFileSync(path.join(seedDir, pInfo.file), "utf-8"));
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

      // D. Seed Services
      log.push("Seeding Services...");
      const servicesData = JSON.parse(fs.readFileSync(path.join(seedDir, "standardized-services.json"), "utf-8"));
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

      // E. Seed Case Studies
      log.push("Seeding Case Studies...");
      const caseStudiesData = JSON.parse(fs.readFileSync(path.join(seedDir, "case-studies.json"), "utf-8"));
      for (const cs of caseStudiesData) {
        await prisma.caseStudy.upsert({
          where: { slug: cs.slug },
          update: cs,
          create: cs,
        });
      }

      // F. Seed Jobs
      log.push("Seeding Jobs...");
      const careersData = JSON.parse(fs.readFileSync(path.join(seedDir, "careers-sections.json"), "utf-8"));
      if (careersData.job_openings && careersData.job_openings.jobs) {
        for (const job of careersData.job_openings.jobs) {
          await prisma.job.upsert({
            where: { id: job.title.toLowerCase().replace(/\s+/g, '-') },
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

      // G. Seed Blog Posts
      log.push("Seeding Blog Posts...");
      const blogPostsData = JSON.parse(fs.readFileSync(path.join(seedDir, "blog.json"), "utf-8"));
      for (const post of blogPostsData) {
        await prisma.blogPost.upsert({
          where: { slug: post.slug },
          update: post,
          create: post,
        });
      }

      // H. Seed Gallery
      log.push("Seeding Gallery...");
      const galleryData = JSON.parse(fs.readFileSync(path.join(seedDir, "gallery.json"), "utf-8"));
      await prisma.galleryImage.deleteMany({});
      for (const img of galleryData) {
        await prisma.galleryImage.create({ data: img });
      }

      // I. Seed Menu Hierarchy
      log.push("Seeding Menu...");
      const menuData = JSON.parse(fs.readFileSync(path.join(seedDir, "menus.json"), "utf-8"));
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
      
      log.push("Automatic seeding successfully finished!");
    } else {
      log.push("Database is already populated. Seeding skipped.");
    }

    const finalPages = await prisma.page.count();
    const finalServices = await prisma.service.count();
    const finalAdmins = await prisma.adminUser.count();

    return NextResponse.json({
      success: true,
      logs: log,
      databaseCounts: {
        pages: finalPages,
        services: finalServices,
        adminUsers: finalAdmins
      },
      diagnosticStatus: "DATABASE_FULLY_OPERATIONAL"
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      logs: log,
      diagnosticStatus: "DATABASE_ERROR"
    }, { status: 500 });
  }
}
