export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import BlogListClient from "./BlogListClient";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      status: true,
      createdAt: true,
      isFeatured: true,
      coverImage: true,
    },
  });

  return (
    <BlogListClient
      initialPosts={posts.map((p: any) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      }))}
    />
  );
}
