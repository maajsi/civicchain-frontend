import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("http://152.42.157.189/*")],
  },
};

export default nextConfig;
