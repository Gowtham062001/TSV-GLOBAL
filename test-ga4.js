require('dotenv').config({ path: '.env' });
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

async function main() {
  console.log("Email:", process.env.GOOGLE_CLIENT_EMAIL);
  console.log("Property:", process.env.GA4_PROPERTY_ID);
  
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'sessions' }],
    });
    console.log("Success! Sessions:", response.rows?.[0]?.metricValues?.[0]?.value);
  } catch (err) {
    console.error("Error fetching:", err.message);
  }
}
main();
