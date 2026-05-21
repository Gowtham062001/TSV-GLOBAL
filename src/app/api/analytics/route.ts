// import { BetaAnalyticsDataClient } from "@google-analytics/data";
const BetaAnalyticsDataClient: any = class {}; // Placeholder

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const propertyId = process.env.GA4_PROPERTY_ID;

// Note: Ensure GOOGLE_APPLICATION_CREDENTIALS points to your service account JSON
const analyticsDataClient = new BetaAnalyticsDataClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!propertyId) {
    return NextResponse.json({ error: "GA4_PROPERTY_ID not configured" }, { status: 500 });
  }

  try {
    // 1. Get Sessions last 30 days
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const sessionData = response.rows?.map(row => ({
      date: row.dimensionValues?.[0].value,
      sessions: parseInt(row.metricValues?.[0].value || "0"),
    })) || [];

    // 2. Top 5 pages
    const [pageResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      limit: 5,
    });

    const topPages = pageResponse.rows?.map(row => ({
      path: row.dimensionValues?.[0].value,
      views: parseInt(row.metricValues?.[0].value || "0"),
    })) || [];

    // 3. Traffic Sources
    const [sourceResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
    });

    const trafficSources = sourceResponse.rows?.map(row => ({
      name: row.dimensionValues?.[0].value,
      value: parseInt(row.metricValues?.[0].value || "0"),
    })) || [];

    // 4. Realtime (Active Users)
    // Note: Realtime API is separate
    let activeUsers = 0;
    try {
      const [realtimeResponse] = await analyticsDataClient.runRealtimeReport({
        property: `properties/${propertyId}`,
        metrics: [{ name: "activeUsers" }],
      });
      activeUsers = parseInt(realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || "0");
    } catch (e) {
      console.warn("Realtime report failed:", e);
    }

    return NextResponse.json({
      sessionData,
      topPages,
      trafficSources,
      activeUsers,
    });
  } catch (error: any) {
    console.error("GA4 Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch analytics" }, { status: 500 });
  }
}
