import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'resources.hellorubric.com',
      },
      {
        protocol: 'https',
        hostname: 'portal.getqpay.com',
      },
    ],
  },
};

export default nextConfig;
