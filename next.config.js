/** @type {import('next').NextConfig} */
const backendOrigin = (process.env.BACKEND_ORIGIN || '').replace(/\/$/, '');

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      '/api/og': [
        './public/fonts/Inter-Regular.ttf',
        './public/fonts/Inter-Bold.ttf',
        './public/images/logo.png',
        './public/og.jpg',
      ],
    },
  },
  // Avoid redirect loops with Django APPEND_SLASH when proxying /api and /admin.
  skipTrailingSlashRedirect: true,
  env: {
    PORT: process.env.PORT || '',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  },
  images: {
    domains: [
      'localhost',
      '127.0.0.1',
      'pickorbeet.com',
      'www.pickorbeet.com',
      'admin.pickorbeet.com',
      'server.pickorbeet.com',
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8777',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'pickorbeet.com',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'www.pickorbeet.com',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'admin.pickorbeet.com',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'server.pickorbeet.com',
        pathname: '/media/**',
      },
    ],
  },
  async rewrites() {
    // Same-domain API/admin: browser hits pickorbeet.com/..., Vercel proxies to Django.
    // BACKEND_ORIGIN must be a public Django URL (e.g. https://admin.pickorbeet.com).
    if (!backendOrigin) {
      return [];
    }

    // Force trailing slashes on Django destinations. Next may strip them from
    // :path*, and Django APPEND_SLASH then 301s back — causing a loop via Vercel.
    return [
      {
        source: '/api/:path*/',
        destination: `${backendOrigin}/api/:path*/`,
      },
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*/`,
      },
      {
        source: '/admin',
        destination: `${backendOrigin}/admin/`,
      },
      {
        source: '/admin/:path*/',
        destination: `${backendOrigin}/admin/:path*/`,
      },
      {
        source: '/admin/:path*',
        destination: `${backendOrigin}/admin/:path*/`,
      },
      {
        source: '/static/:path*',
        destination: `${backendOrigin}/static/:path*`,
      },
      {
        source: '/media/:path*',
        destination: `${backendOrigin}/media/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
