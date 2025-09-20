/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;