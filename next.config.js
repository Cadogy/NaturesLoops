/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true
  },
  typescript: {
    ignoreBuildErrors: false
  }
};

module.exports = nextConfig;