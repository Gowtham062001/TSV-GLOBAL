import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Initialize the Google Analytics Data API client
// We parse the private key to handle newline characters correctly
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const propertyId = process.env.GA4_PROPERTY_ID;

export async function GET() {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !propertyId) {
    return NextResponse.json(
      { error: 'Google Analytics credentials or Property ID are missing from environment variables' },
      { status: 500 }
    );
  }

  try {
    // 1. Fetch KPI Metrics (Total Sessions, Active Users, Avg Engagement Time, Event Count)
    const [metricsResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' },
        { name: 'eventCount' },
      ],
    });

    const kpiRow = metricsResponse.rows?.[0]?.metricValues;
    const kpiData = {
      totalSessions: kpiRow?.[0]?.value || '0',
      activeUsers: kpiRow?.[1]?.value || '0',
      avgEngagementTime: Math.floor(Number(kpiRow?.[2]?.value || '0')), // in seconds
      eventCount: kpiRow?.[3]?.value || '0',
    };

    // 2. Fetch Sessions Data over the last 30 days (for the Area Chart)
    const [sessionsResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'date' },
      ],
      metrics: [
        { name: 'sessions' },
      ],
      orderBys: [
        {
          dimension: { dimensionName: 'date' },
          desc: false, // Chronological order
        },
      ],
    });

    const sessionsData = (sessionsResponse.rows || []).map(row => {
      const dateStr = row.dimensionValues?.[0]?.value || '';
      // Format YYYYMMDD to "MMM DD"
      const formattedDate = dateStr.length === 8 
        ? new Date(
            parseInt(dateStr.substring(0, 4)), 
            parseInt(dateStr.substring(4, 6)) - 1, 
            parseInt(dateStr.substring(6, 8))
          ).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
        : dateStr;
        
      return {
        date: formattedDate,
        sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
      };
    });

    // 3. Fetch Top Pages by Views
    const [topPagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'pagePath' },
      ],
      metrics: [
        { name: 'screenPageViews' },
      ],
      orderBys: [
        {
          metric: { metricName: 'screenPageViews' },
          desc: true,
        },
      ],
      limit: 5,
    });

    const topPagesData = (topPagesResponse.rows || []).map(row => ({
      path: row.dimensionValues?.[0]?.value || '/',
      views: parseInt(row.metricValues?.[0]?.value || '0', 10),
    }));

    // 4. Fetch Traffic Sources
    const [trafficResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'sessionDefaultChannelGroup' },
      ],
      metrics: [
        { name: 'sessions' },
      ],
      orderBys: [
        {
          metric: { metricName: 'sessions' },
          desc: true,
        },
      ],
      limit: 4,
    });

    const colors = ['#0f1523', '#c1000a', '#64748b', '#94a3b8'];
    const trafficSourceData = (trafficResponse.rows || []).map((row, index) => ({
      name: row.dimensionValues?.[0]?.value || 'Unknown',
      value: parseInt(row.metricValues?.[0]?.value || '0', 10),
      color: colors[index % colors.length],
    }));

    return NextResponse.json({
      success: true,
      data: {
        kpi: kpiData,
        sessionsData,
        topPagesData,
        trafficSourceData,
      }
    });

  } catch (error: any) {
    console.error('GA4 Data Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: error.message },
      { status: 500 }
    );
  }
}
