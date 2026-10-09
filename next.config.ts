import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't advertise the framework in an `X-Powered-By` response header.
  poweredByHeader: false,
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
    //
    // Every response also gets baseline browser protections. The CSP only sets
    // `frame-ancestors` (no other site may frame these pages); a script/style
    // policy would have to allow GA, YouTube, Sanity and the Studio, and is a
    // separate decision.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
