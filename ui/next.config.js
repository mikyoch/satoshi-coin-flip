/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });

    return config;
  },
  async redirects() {
    return [
      {
        source: '/:slug/:path*', // redirect any path to root and preserve parameters
        destination: '/',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig
