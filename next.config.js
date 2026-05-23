/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  transpilePackages: ['leaflet', 'react-leaflet']
}
module.exports = nextConfig
