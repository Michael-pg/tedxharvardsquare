import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Content images are served from Sanity's CDN (project k0dqlqmb).
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/k0dqlqmb/**" },
    ],
  },
  async redirects() {
    return [
      // The dot-system home was previewed at /home2 before it replaced `/`.
      { source: "/home2", destination: "/", permanent: true },
      // Webflow's password-protected run-of-show for the Feb 2026 edition.
      { source: "/schedule", destination: "/flagship", permanent: true },
    ];
  },
  async headers() {
    // Only the real domain belongs in search results. The Vercel hosts (the
    // production alias and every preview) serve the same pages, so they are
    // marked noindex to keep them from competing with it.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
