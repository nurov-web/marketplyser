import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "*.trycloudflare.com" },
      { protocol: "https", hostname: "*.up.railway.app" },
      { protocol: "https", hostname: "*.onrender.com" },
      { protocol: "https", hostname: "*.fly.dev" },
      { protocol: "https", hostname: "*.koyeb.app" },
      { protocol: "https", hostname: "*.vercel.app" },
    ],
  },
  async rewrites() {
    const api = process.env.API_INTERNAL_URL || (process.env.VERCEL ? "" : "http://127.0.0.1:4000");
    if (!api) return [];
    return [
      { source: "/api/:path*", destination: `${api}/api/:path*` },
      { source: "/uploads/:path*", destination: `${api}/uploads/:path*` },
      { source: "/socket.io/:path*", destination: `${api}/socket.io/:path*` },
    ];
  },
};

export default nextConfig;
