import { getSetting } from '@/lib/settings';

export async function GET() {
  const robotsTxt = await getSetting(
    'robotsTxt',
    `User-agent: *\nDisallow: /admin\nDisallow: /api\nSitemap: https://tsvglobal.com/sitemap.xml`
  );

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
