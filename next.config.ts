import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Content images are served from Sanity's CDN (project k0dqlqmb).
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/k0dqlqmb/**" },
    ],
  },
};

export default nextConfig;
