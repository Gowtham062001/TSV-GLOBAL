import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth-check";
import { writeAuditLog } from "@/lib/audit";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();

    const oldService = await prisma.service.findUnique({
      where: { id: params.id },
      select: { slug: true, title: true }
    });

    const newSlug = data.slug || oldService?.slug;

    if (oldService?.slug && oldService.slug !== newSlug) {
      await prisma.redirect.upsert({
        where: { from: `/services/${oldService.slug}` },
        update: { to: `/services/${newSlug}`, type: 301, isActive: true },
        create: {
          from: `/services/${oldService.slug}`,
          to: `/services/${newSlug}`,
          type: 301,
          isActive: true
        }
      });

      await prisma.menuItem.updateMany({
        where: { url: `/services/${oldService.slug}` },
        data: { url: `/services/${newSlug}` }
      });

      const childMenuItems = await prisma.menuItem.findMany({
        where: {
          url: {
            startsWith: `/services/${oldService.slug}/`
          }
        }
      });
      for (const item of childMenuItems) {
        const updatedUrl = item.url.replace(`/services/${oldService.slug}/`, `/services/${newSlug}/`);
        await prisma.menuItem.update({
          where: { id: item.id },
          data: { url: updatedUrl }
        });
      }
    }

    // Sync menu item labels with updated service name
    if (oldService?.title && oldService.title !== data.title) {
      await prisma.menuItem.updateMany({
        where: { 
          url: `/services/${newSlug}`,
          label: oldService.title 
        },
        data: { label: data.title }
      });
    }

    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        image: data.image,
        status: data.status,
        isVisible: data.isVisible !== undefined ? data.isVisible : undefined,
        seoData: data.seoData,
      },
    });

    if (oldService?.slug) {
      revalidatePath(`/services/${oldService.slug}`);
    }
    revalidatePath("/services");
    revalidatePath(`/services/${service.slug}`);
    revalidatePath("/", "layout");

    // Audit Log
    const session = await getAdminSession();
    if (session?.user) {
      await writeAuditLog({
        userId: (session.user as any).id,
        action: "UPDATE",
        entity: "Service",
        entityId: service.id,
        changes: { title: service.title }
      });
    }
    return NextResponse.json(service);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error updating service" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // 1. Set parentId of child services to null to prevent self-referencing foreign key violations
    await prisma.service.updateMany({
      where: { parentId: params.id },
      data: { parentId: null }
    });

    // 2. Safely delete service sections first to avoid foreign key violations in case the DB cascade is missing
    await prisma.serviceSection.deleteMany({
      where: { serviceId: params.id },
    });

    // 3. Delete the service
    await prisma.service.delete({
      where: { id: params.id },
    });

    // Audit Log
    const session = await getAdminSession();
    if (session?.user) {
      await writeAuditLog({
        userId: (session.user as any).id,
        action: "DELETE",
        entity: "Service",
        entityId: params.id,
      });
    }

    revalidatePath("/services");
    return NextResponse.json({ message: "Service deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error deleting service" }, { status: 500 });
  }
}
