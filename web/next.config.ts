import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only export static files for production builds / Capacitor export
  // In development, allow dynamic routes without requiring pre-generated static params
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
