/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standard tracing on Vercel; fallback for local Windows tests: outputFileTracing: false
  outputFileTracing: process.env.VERCEL ? undefined : false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ],
  },
};

export default nextConfig;
