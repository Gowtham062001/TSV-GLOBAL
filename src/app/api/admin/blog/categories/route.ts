import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DEFAULT_CATEGORIES = [
  { id: "cat-1", name: "Industry Insights", slug: "industry-insights" },
  { id: "cat-2", name: "Logistics Trends", slug: "logistics-trends" },
  { id: "cat-3", name: "Company News", slug: "company-news" },
  { id: "cat-4", name: "Global Trade", slug: "global-trade" },
  { id: "cat-5", name: "Case Studies", slug: "case-studies" },
  { id: "cat-6", name: "Events", slug: "events" }
];

async function getCategoriesList() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "blog_categories" }
  });

  if (!setting) {
    // Seed default categories
    const created = await prisma.siteSetting.create({
      data: {
        key: "blog_categories",
        value: JSON.stringify(DEFAULT_CATEGORIES),
        group: "BLOG"
      }
    });
    return JSON.parse(created.value);
  }

  try {
    return JSON.parse(setting.value);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

async function saveCategoriesList(categories: any[]) {
  return prisma.siteSetting.upsert({
    where: { key: "blog_categories" },
    update: { value: JSON.stringify(categories) },
    create: {
      key: "blog_categories",
      value: JSON.stringify(categories),
      group: "BLOG"
    }
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await getCategoriesList();
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = slugify(trimmedName);

    const categories = await getCategoriesList();

    // Check for duplicate name or slug
    const duplicate = categories.find(
      (c: any) => c.name.toLowerCase() === trimmedName.toLowerCase() || c.slug === slug
    );

    if (duplicate) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }

    const newCategory = {
      id: `cat-${Date.now()}`,
      name: trimmedName,
      slug
    };

    categories.push(newCategory);
    await saveCategoriesList(categories);

    await writeAuditLog({
      userId: (session.user as any).id,
      action: "CREATE",
      entity: "BlogCategory",
      entityId: newCategory.id,
      changes: { name: newCategory.name, slug: newCategory.slug }
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    console.error("[Categories API] Failed to create category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name } = body;

    if (!id || !name || !name.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = slugify(trimmedName);

    const categories = await getCategoriesList();
    const index = categories.findIndex((c: any) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check duplicate except itself
    const duplicate = categories.find(
      (c: any) => c.id !== id && (c.name.toLowerCase() === trimmedName.toLowerCase() || c.slug === slug)
    );

    if (duplicate) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
    }

    const oldCategory = categories[index];
    const updatedCategory = {
      ...oldCategory,
      name: trimmedName,
      slug
    };

    categories[index] = updatedCategory;
    await saveCategoriesList(categories);

    await writeAuditLog({
      userId: (session.user as any).id,
      action: "UPDATE",
      entity: "BlogCategory",
      entityId: id,
      changes: { old: oldCategory, new: updatedCategory }
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("[Categories API] Failed to update category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing category ID" }, { status: 400 });
    }

    const categories = await getCategoriesList();
    const categoryToDelete = categories.find((c: any) => c.id === id);

    if (!categoryToDelete) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const updatedCategories = categories.filter((c: any) => c.id !== id);
    await saveCategoriesList(updatedCategories);

    await writeAuditLog({
      userId: (session.user as any).id,
      action: "DELETE",
      entity: "BlogCategory",
      entityId: id,
      changes: { name: categoryToDelete.name }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Categories API] Failed to delete category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
