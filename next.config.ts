import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure proper build output
  output: 'standalone',
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
  // External packages that should not be bundled
  serverExternalPackages: ['pdf-parse'],
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, configFile, stripPrefix, urlPrefix, include, ignore

  org: "subhanshu",
  project: "ai-recruiter",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
};

// Make sure adding Sentry options is the last code to run before exporting
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
