import { prisma } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/api-response";
import { getAdminSession } from "@/lib/auth-check";
import { logAudit } from "@/lib/audit-logger";
import { blogPostSchema } from "@/lib/validations/admin";
import slugify from "slugify";

// Auto-add a menu item for a published blog post under a "Blog" parent
async function syncBlogMenuItem(postId: string, title: string, slug: string, action: 'upsert' | 'delete') {
  try {
    // Find or create the Blog parent menu item
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

    // Upsert the child menu item for this blog post
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

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return apiError("Unauthorized", 401);

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.blogPost.count(),
    ]);

    return apiResponse({
      data: posts,
      meta: { total, page, limit }
    });
  } catch {
    return apiError("Failed to fetch posts", 500);
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return apiError("Unauthorized", 401);

  try {
    const body = await request.json();
    const validated = blogPostSchema.parse(body);
    
    const slug = validated.slug || slugify(validated.title, { lower: true });

    const post = await prisma.blogPost.create({
      data: {
        ...validated,
        slug,
      },
    });

    // Auto-add to frontend menu if published
    if (post.status === 'PUBLISHED') {
      await syncBlogMenuItem(post.id, post.title, post.slug, 'upsert');
    }

    await logAudit(
      session.user?.email || "unknown",
      "CREATE_BLOG_POST",
      "blogPost",
      post.id,
      { title: post.title }
    );

    return apiResponse({ data: post });
  } catch {
    return apiError("Failed to create blog post", 500);
  }
}
