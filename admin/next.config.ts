import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/current-affairs/:path*",
        destination: "http://localhost:3000/api/current-affairs/:path*",
      },
    ];
  },
};

export default nextConfig;
