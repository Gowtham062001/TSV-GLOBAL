export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import React from "react";
import { GalleryGridClient } from "./GalleryGridClient";

import { isSuperAdmin } from "@/lib/auth-check";

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: [
      { category: "asc" },
      { order: "asc" },
      { createdAt: "desc" }
    ],
  });
  const userIsSuperAdmin = await isSuperAdmin();
  return <GalleryGridClient initialImages={images} isSuperAdmin={userIsSuperAdmin} />;
}
