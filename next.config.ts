import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // Suppresses source map upload logs during build
  silent: true,
  // Disable Sentry entirely if no DSN is set (e.g. local dev without credentials)
  dryRun: !process.env.NEXT_PUBLIC_SENTRY_DSN,
});
