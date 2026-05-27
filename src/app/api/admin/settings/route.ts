import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function PUT(request: Request) {
  try {
    const { settings, globalSeo } = await request.json();

    // 1. Update Site Settings (Sequentially to prevent connection pool exhaustion)
    if (settings && typeof settings === "object") {
      for (const [key, value] of Object.entries(settings)) {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), group: "GENERAL" },
        });
      }
    }

    // 2. Update Global SEO (mapped to site settings keys)
    if (globalSeo) {
      if (globalSeo.titleTemplate !== undefined) {
        await prisma.siteSetting.upsert({
          where: { key: "seo_title_template" },
          update: { value: String(globalSeo.titleTemplate) },
          create: { key: "seo_title_template", value: String(globalSeo.titleTemplate), group: "GENERAL" },
        });
      }
      if (globalSeo.defaultDescription !== undefined) {
        await prisma.siteSetting.upsert({
          where: { key: "seo_meta_description" },
          update: { value: String(globalSeo.defaultDescription) },
          create: { key: "seo_meta_description", value: String(globalSeo.defaultDescription), group: "GENERAL" },
        });
      }
    }

    // 3. Revalidate public site and admin pages so changes appear immediately
    revalidatePath('/', 'layout');
    revalidatePath('/admin/settings');
    revalidatePath('/admin/analytics');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Settings API] Error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

