import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Exclude sample code directory from build
  outputFileTracingExcludes: {
    '*': ['./sample code/**/*'],
  },
  // Exclude sample code from TypeScript compilation
  typescript: {
    ignoreBuildErrors: false,
  },
  // Exclude sample code from ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
