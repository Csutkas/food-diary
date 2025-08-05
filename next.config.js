/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    forceSwcTransforms: false,
  },
  swcMinify: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  webpack: (config, { dev, isServer }) => {
    // Completely disable all minification to avoid Terser issues
    config.optimization.minimize = false;
    config.optimization.minimizer = [];

    // Remove TerserPlugin if it exists
    if (config.optimization.minimizer) {
      config.optimization.minimizer = config.optimization.minimizer.filter(
        (plugin) => plugin.constructor.name !== "TerserPlugin"
      );
    }

    return config;
  },
};

module.exports = nextConfig;
