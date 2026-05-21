import { prisma } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/api-response";
import { revalidatePath } from "next/cache";
import { getAdminSession, canEdit } from "@/lib/auth-check";
import { writeAuditLog } from "@/lib/audit";
import { blogPostSchema } from "@/lib/validations/admin";
import { sanitizeHtml } from "@/lib/sanitize";

// Auto-sync a blog post's menu item whenever it is published/unpublished/deleted
async function syncBlogMenuItem(title: string, slug: string, action: 'upsert' | 'delete') {
  try {
    let blogParent = await prisma.menuItem.findFirst({ where: { label: 'Blog', parentId: null } });
    if (!blogParent) {
      const maxOrder = await prisma.menuItem.findFirst({ where: { parentId: null }, orderBy: { order: 'desc' }, select: { order: true } });
      blogParent = await prisma.menuItem.create({
        data: { label: 'Blog', url: '/blog', order: (maxOrder?.order ?? 0) + 1, isActive: true, target: '_self' }
      });
    }
    if (action === 'delete') {
      await prisma.menuItem.deleteMany({ where: { url: `/blog/${slug}`, parentId: blogParent.id } });
      return;
    }
    const existing = await prisma.menuItem.findFirst({ where: { url: `/blog/${slug}`, parentId: blogParent.id } });
    const maxChild = await prisma.menuItem.findFirst({ where: { parentId: blogParent.id }, orderBy: { order: 'desc' }, select: { order: true } });
    if (existing) {
      await prisma.menuItem.update({ where: { id: existing.id }, data: { label: title, isActive: true } });
    } else {
      await prisma.menuItem.create({
        data: { label: title, url: `/blog/${slug}`, parentId: blogParent.id, order: (maxChild?.order ?? 0) + 1, isActive: true, target: '_self' }
      });
    }
  } catch (e) {
    console.error('[Blog Menu Sync] Error:', e);
  }
}

type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string;
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return apiError("Unauthorized", 401);

  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: params.id },
    });

    if (!post) return apiError("Post not found", 404);

    return apiResponse({ data: post });
  } catch {
    return apiError("Failed to fetch post", 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session || !session.user) return apiError("Unauthorized", 401);

  if (!(await canEdit())) {
    return apiError("Insufficient permissions (Viewer only)", 403);
  }

  try {
    const body = await request.json();
    const validated = blogPostSchema.parse(body);

    // Sanitize rich text content
    if (typeof validated.content === "string") {
      validated.content = sanitizeHtml(validated.content);
    }

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: validated,
    });

    // Sync the frontend menu based on publish status
    if (post.status === 'PUBLISHED') {
      await syncBlogMenuItem(post.title, post.slug, 'upsert');
    } else {
      // Draft/Scheduled — remove from frontend menu
      await syncBlogMenuItem(post.title, post.slug, 'delete');
    }

    const user = session.user as any;
    await writeAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "BlogPost",
      entityId: post.id,
      changes: { title: post.title }
    });
    
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);

    return apiResponse({ data: post });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return apiError((error as any).errors[0].message, 400);
    }
    return apiError("Failed to update blog post", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session || !session.user) return apiError("Unauthorized", 401);

  if (!(await canEdit())) {
    return apiError("Insufficient permissions (Viewer only)", 403);
  }

  try {
    const post = await prisma.blogPost.delete({
      where: { id: params.id },
    });

    // Remove from frontend menu
    await syncBlogMenuItem(post.title, post.slug, 'delete');

    const user = session.user as any;
    await writeAuditLog({
      userId: user.id,
      action: "DELETE",
      entity: "BlogPost",
      entityId: post.id,
      changes: { title: post.title }
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);

    return apiResponse({ data: { success: true } });
  } catch {
    return apiError("Failed to delete blog post", 500);
  }
}
