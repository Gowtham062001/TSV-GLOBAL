export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import BlogEditorClient from "./BlogEditorClient";
export default async function AdminEditBlogPost({ params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: { id: params.id },
  });
  if (!post) {
    notFound();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <BlogEditorClient post={post as any} />;
}
