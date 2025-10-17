import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "152.42.157.189",
        port: "3000",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;