import { prisma } from "./db";

export interface MenuItemWithChildren {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  target: string;
  parentId: string | null;
  order: number;
  children: MenuItemWithChildren[];
}

export async function getMenuItems(): Promise<MenuItemWithChildren[]> {
  try {
    const allItems = await prisma.menuItem.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        }
      }
    });

    // Build hierarchy (recursive)
    const buildHierarchy = (parentId: string | null = null): MenuItemWithChildren[] => {
      return allItems
        .filter((item: any) => item.parentId === parentId)
        .map((item: any) => ({
          id: item.id,
          label: item.label,
          url: item.url,
          icon: item.icon,
          target: item.target,
          parentId: item.parentId,
          order: item.order,
          children: buildHierarchy(item.id),
        }));
    };

    return buildHierarchy(null);
  } catch (error) {
    console.error("[Menu Lib] Error fetching menu items:", error);
    return [];
  }
}
