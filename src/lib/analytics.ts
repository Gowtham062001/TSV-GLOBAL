import { prisma } from "./db";

/**
 * Reads GTM ID and GA4 Measurement ID from the SiteSetting table.
 * Returns null values when the settings are not configured.
 * This is called only from Server Components (layout.tsx).
 */
export async function getAnalyticsConfig(): Promise<{
  gtmId: string | null;
  ga4Id: string | null;
}> {
  try {
    const [gtmSetting, ga4Setting] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: "gtmId" } }),
      prisma.siteSetting.findUnique({ where: { key: "gaId" } }),
    ]);

    return {
      gtmId: gtmSetting ? String(gtmSetting.value).replace(/^"|"$/g, "") : null,
      ga4Id: ga4Setting ? String(ga4Setting.value).replace(/^"|"$/g, "") : null,
    };
  } catch {
    // Fail gracefully — analytics should never break the page
    return { gtmId: null, ga4Id: null };
  }
}
