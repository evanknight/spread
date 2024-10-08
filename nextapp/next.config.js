/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['node-fetch'], 
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['pages', 'components', 'lib', 'utils', 'types', 'app']
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_ODDS_API_KEY: process.env.NEXT_PUBLIC_ODDS_API_KEY,
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || 'development',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'spread-nextapp.vercel.app',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
}

module.exports = nextConfig