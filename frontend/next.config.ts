import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Diperbesar menjadi 100MB untuk mendukung upload video
    },
  },
};

export default nextConfig;
