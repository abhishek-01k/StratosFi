/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'assets.coingecko.com',
      'tokens.1inch.io',
      's2.coinmarketcap.com',
      'raw.githubusercontent.com',
      'tokens-data.1inch.io',
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
