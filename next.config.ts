import type { NextConfig } from 'next'

const WP_ORIGIN = 'https://triolla.io'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/wp-content/:path*',
        destination: `${WP_ORIGIN}/wp-content/:path*`,
      },
    ]
  },
}

export default nextConfig
