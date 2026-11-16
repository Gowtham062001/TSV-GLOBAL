// Safeguard NEXTAUTH_URL during build/prerender if placeholder or unexpanded domain is set
if (process.env.NEXTAUTH_URL) {
  try {
    const candidate = process.env.NEXTAUTH_URL.startsWith("http")
      ? process.env.NEXTAUTH_URL
      : `https://${process.env.NEXTAUTH_URL}`;
    new URL(candidate);
  } catch {
    process.env.NEXTAUTH_URL = process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : "https://www.tsvglobal.com";
  }
}

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
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
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
