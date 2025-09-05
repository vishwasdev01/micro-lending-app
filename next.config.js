/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix workspace root warning
  outputFileTracingRoot: process.cwd(),
  // Enable static optimization
  trailingSlash: false,
  // Image optimization
  images: {
    unoptimized: true, // For static export if needed
  },
}

module.exports = nextConfig
