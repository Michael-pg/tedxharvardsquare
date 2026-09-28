import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Content images are served from Sanity's CDN (project k0dqlqmb).
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/k0dqlqmb/**" },
    ],
  },
  async redirects() {
    // The dot-system home was previewed at /home2 before it replaced `/`.
    return [{ source: "/home2", destination: "/", permanent: true }];
  },
};

export default nextConfig;
