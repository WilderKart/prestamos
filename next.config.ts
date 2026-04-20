import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  } as any,
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
