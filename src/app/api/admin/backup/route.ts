import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
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
    const [
      pages,
      pageSections,
      services,
      serviceSections,
      blogPosts,
      caseStudies,
      galleryImages,
      menuItems,
      contactSubmissions,
      brochureDownloads,
      siteSettings,
      adminUsers,
      webhookConfigs,
      redirects,
      auditLogs,
      apiKeys,
    ] = await Promise.all([
      prisma.page.findMany(),
      prisma.pageSection.findMany(),
      prisma.service.findMany(),
      prisma.serviceSection.findMany(),
      prisma.blogPost.findMany(),
      prisma.caseStudy.findMany(),
      prisma.galleryImage.findMany(),
      prisma.menuItem.findMany(),
      prisma.contactSubmission.findMany(),
      prisma.brochureDownload.findMany(),
      prisma.siteSetting.findMany(),
      prisma.adminUser.findMany({
        select: {
          id: true, name: true, email: true,
          role: true, isActive: true,
          lastLogin: true
        }
      }),
      prisma.webhookConfig.findMany(),
      prisma.redirect.findMany(),
      prisma.auditLog.findMany({
        take: 500,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.apiKey.findMany({
        select: {
          id: true, name: true, permissions: true,
          isActive: true, expiresAt: true
        }
      }),
    ]);

    const backup = {
      meta: {
        exportedAt: new Date().toISOString(),
        exportedBy: session.user.email,
        version: '1.0',
        appName: 'TSV GLOBAL SOLUTIONS',
        totalRecords: {
          pages: pages.length,
          pageSections: pageSections.length,
          services: services.length,
          serviceSections: serviceSections.length,
          blogPosts: blogPosts.length,
          caseStudies: caseStudies.length,
          galleryImages: galleryImages.length,
          menuItems: menuItems.length,
          contactSubmissions: contactSubmissions.length,
          brochureDownloads: brochureDownloads.length,
          siteSettings: siteSettings.length,
        }
      },
      data: {
        pages,
        pageSections,
        services,
        serviceSections,
        blogPosts,
        caseStudies,
        galleryImages,
        menuItems,
        contactSubmissions,
        brochureDownloads,
        siteSettings,
        adminUsers,
        webhookConfigs,
        redirects,
        auditLogs,
        apiKeys,
      }
    };

    const json = JSON.stringify(backup, null, 2);
    const filename = `tsv-backup-${new Date().toISOString().slice(0,10)}.json`;

    return new Response(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(json).toString(),
      }
    });

  } catch (error) {
    console.error('Backup failed:', error);
    return Response.json(
      { error: 'Backup failed', details: String(error) },
      { status: 500 }
    );
  }
}
