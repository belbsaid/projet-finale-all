import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Required in Next.js 16
    qualities: [25, 50, 75, 90],
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
