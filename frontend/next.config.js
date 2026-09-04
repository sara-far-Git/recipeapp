/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production";
const API_BACKEND = (
  process.env.NEXT_PUBLIC_API_URL || "https://recipeapp-backend-iwn0.onrender.com"
).replace(/\/$/, "");

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.amazonaws.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
      // Long-term cache for production assets. In dev, avoid stale chunks after UI edits.
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: isProduction
              ? "public, max-age=31536000, immutable"
              : "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      // Cache icons and manifest
      {
        source: "/(icon-192|icon-512|icon.png|apple-icon.png|manifest.json|sw.js)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/icon-192", destination: "/icon-192.png" },
      { source: "/icon-512", destination: "/icon-512.png" },
      // The browser calls the API at a relative path, and vercel.json rewrites
      // it to the backend. The dev server has no such rewrite, so without this
      // every client-side call 404s and nothing data-driven can be tried
      // locally.
      ...(isProduction
        ? []
        : [
            {
              source: "/api/v1/:path*",
              destination: `${API_BACKEND}/api/v1/:path*`,
            },
          ]),
    ];
  },
  compress: true,
};

module.exports = nextConfig;
