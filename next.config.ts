import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const origin = process.env.API_UPSTREAM_ORIGIN;
    return origin
      ? [{ source: '/api/v1/:path*', destination: new URL('/api/v1/', origin).href + ':path*' }]
      : [];
  },
};
export default nextConfig;
