import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  reactStrictMode: false,
  allowedDevOrigins: [
    'localhost',
    '.space.z.ai',
    '.z.ai',
    'preview-chat-c237887c-8a61-402a-bfad-19d7c7a5a09c.space.z.ai',
  ],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
