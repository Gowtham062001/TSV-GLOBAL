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
  },
  staticPageGenerationTimeout: 300,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    cpus: 1,
    serverComponentsExternalPackages: ['@prisma/client'],
    outputFileTracingExcludes: {
      '*': [
        'public/assets/img/**',
        'public/img/**',
        'public/uploads/**'
      ]
    }
  }
};

export default nextConfig;
