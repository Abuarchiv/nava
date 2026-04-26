import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@nava/ui', '@nava/core', '@nava/types', '@nava/supabase'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'nava-app.vercel.app'],
    },
  },
}

export default nextConfig
