import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
