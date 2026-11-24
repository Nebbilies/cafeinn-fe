import { isIPv4 } from 'node:net';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const origin = process.env.API_UPSTREAM_ORIGIN;
    if (!origin) return [];
    const upstream = new URL(origin);
    const { hostname, protocol } = upstream;
    const loopback = hostname === 'localhost' || hostname === '[::1]' ||
      (isIPv4(hostname) && hostname.startsWith('127.'));
    if (protocol !== 'https:' && (protocol !== 'http:' || !loopback)) {
      throw new Error('API_UPSTREAM_ORIGIN must use HTTPS outside loopback.');
    }
    return [{ source: '/api/v1/:path*', destination: new URL('/api/v1/', upstream).href + ':path*' }];
  },
};
export default nextConfig;
