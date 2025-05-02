/** @type {import('next').NextConfig} */
const nextConfig = {
  // Simplified webpack configuration
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/.git/**']
    }
    return config
  },
  // Basic image configuration
  images: {
    domains: ['fantasy.premierleague.com'],
    formats: ['image/avif', 'image/webp']
  }
}

module.exports = nextConfig 