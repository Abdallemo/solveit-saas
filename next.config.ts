import { execSync } from "child_process";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  generateBuildId: async () => {
    try {
      const commitHash = execSync("git rev-parse HEAD").toString().trim();
      return commitHash;
    } catch (e) {
      console.error("Failed to get Git hash for build ID. Using default.", e);
      return "next-build-id-fallback";
    }
  },
  productionBrowserSourceMaps: true,
  webpack(config, { dev, isServer }) {
    if (!dev) {
      config.devtool = "source-map";
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-c60addcb244c4d23b18a98d686f3195e.r2.dev",
        pathname: "/**",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
