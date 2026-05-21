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
    const counts = await Promise.all([
      prisma.page.count(),
      prisma.service.count(),
      prisma.blogPost.count(),
      prisma.caseStudy.count(),
      prisma.galleryImage.count(),
      prisma.menuItem.count(),
      prisma.contactSubmission.count(),
      prisma.brochureDownload.count(),
      prisma.siteSetting.count(),
    ]);

    return Response.json({
      counts: {
        pages: counts[0],
        services: counts[1],
        blogPosts: counts[2],
        caseStudies: counts[3],
        galleryImages: counts[4],
        menuItems: counts[5],
        contactSubmissions: counts[6],
        brochureDownloads: counts[7],
        siteSettings: counts[8],
      },
      lastBackup: await prisma.auditLog.findFirst({
        where: { action: 'BACKUP_EXPORT' },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      }),
      lastRestore: await prisma.auditLog.findFirst({
        where: { action: 'RESTORE' },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, changes: true }
      }),
    });
  } catch (error) {
    console.error('Backup status failed:', error);
    return Response.json(
      { error: 'Failed to fetch status', details: String(error) },
      { status: 500 }
    );
  }
}
