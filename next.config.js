/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker
  output: 'standalone',
  // Disable telemetry
  telemetry: false,
}

module.exports = nextConfig
