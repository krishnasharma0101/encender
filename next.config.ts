import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.encenderfashion.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8055',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'host.docker.internal',
        port: '8055',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'encender-backend',
        port: '8055',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
  async rewrites() {
    const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    return [
      {
        source: '/items/:path*',
        destination: `${directusUrl}/items/:path*`,
      },
      {
        source: '/assets/:path*',
        destination: `${directusUrl}/assets/:path*`,
      },
    ];
  },
};

export default nextConfig;