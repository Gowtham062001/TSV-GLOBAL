/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Canonical sitemap URL → dynamic API route
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'tsvglobal.vercel.app',
      },
    ],
    // Allow unoptimized local images from /public folder
    unoptimized: true,
  },
  staticPageGenerationTimeout: 300,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    // serverComponentsExternalPackages is the correct key for Next.js 14
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

export default nextConfig;
