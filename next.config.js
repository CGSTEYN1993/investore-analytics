/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.investoreanalytics.com'],
    unoptimized: true,
  },
  // Rewrites only enabled when backend is running
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/:path*',
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
