import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'];
  if (!allowedRoles.includes((session.user as any).role)) {
    return Response.json(
      { error: 'Unauthorized. Admin required.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    if (!body?.meta?.version || !body?.data) {
      return Response.json(
        { error: 'Invalid backup file format' },
        { status: 400 }
      );
    }

    if (body.meta.appName !== 'TSV GLOBAL SOLUTIONS' && body.meta.appName !== 'TSV Insight Engine') {
      return Response.json(
        { error: 'Backup file is not from TSV system' },
        { status: 400 }
      );
    }

    const { data } = body;
    const results: Record<string, number> = {};

    if (data.siteSettings?.length) {
      for (const item of data.siteSettings) {
        await prisma.siteSetting.upsert({
          where: { id: item.id },
          update: { key: item.key, value: item.value },
          create: item
        });
      }
      results.siteSettings = data.siteSettings.length;
    }

    if (data.pages?.length) {
      for (const item of data.pages) {
        const { id, ...rest } = item;
        await prisma.page.upsert({
          where: { id },
          update: rest,
          create: item
        });
      }
      results.pages = data.pages.length;
    }

    if (data.pageSections?.length) {
      for (const item of data.pageSections) {
        const { id, ...rest } = item;
        await prisma.pageSection.upsert({
          where: { id },
          update: rest,
          create: item
        });
      }
      results.pageSections = data.pageSections.length;
    }

    if (data.services?.length) {
      for (const item of data.services) {
        const { id, ...rest } = item;
        await prisma.service.upsert({
          where: { id },
          update: rest,
          create: item
        });
      }
      results.services = data.services.length;
    }

    if (data.serviceSections?.length) {
      for (const item of data.serviceSections) {
        const { id, ...rest } = item;
        await prisma.serviceSection.upsert({
          where: { id },
          update: rest,
          create: item
        });
      }
      results.serviceSections = data.serviceSections.length;
    }

    if (data.blogPosts?.length) {
      for (const item of data.blogPosts) {
        const { id, ...rest } = item;
        await prisma.blogPost.upsert({
          where: { id },
          update: rest,
          create: item
        });
      }
      results.blogPosts = data.blogPosts.length;
    }

    if (data.caseStudies?.length) {
      for (const item of data.caseStudies) {
        const { id, ...rest } = item;
        await prisma.caseStudy.upsert({
          where: { id },
          update: rest,
          create: item
        });
      }
      results.caseStudies = data.caseStudies.length;
    }

    if (data.galleryImages?.length) {
      for (const item of data.galleryImages) {
        const { id, ...rest } = item;
        await prisma.galleryImage.upsert({
          where: { id },
          update: rest,
          create: item
        });
      }
      results.galleryImages = data.galleryImages.length;
    }

    if (data.menuItems?.length) {
      for (const item of data.menuItems) {
        const { id, ...rest } = item;
        await prisma.menuItem.upsert({
          where: { id },
          update: rest,
          create: item
        });
      }
      results.menuItems = data.menuItems.length;
    }

    if (data.redirects?.length) {
      for (const item of data.redirects) {
        const { id, ...rest } = item;
        await prisma.redirect.upsert({
          where: { id },
          update: rest,
          create: item
        });
      }
      results.redirects = data.redirects.length;
    }

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id || 'system',
        action: 'RESTORE',
        entity: 'Database',
        entityId: 'full-restore',
        changes: {
          restoredBy: session.user.email,
          backupDate: body.meta.exportedAt,
          tablesRestored: Object.keys(results),
          recordCounts: results
        }
      }
    });

    return Response.json({
      success: true,
      message: 'Database restored successfully',
      restored: results,
      totalRecords: Object.values(results).reduce((a, b) => a + b, 0)
    });

  } catch (error) {
    console.error('Restore failed:', error);
    return Response.json(
      { error: 'Restore failed', details: String(error) },
      { status: 500 }
    );
  }
}
