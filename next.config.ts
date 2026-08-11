import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // Keep the SW for Chromium installability; do not pack the app shell for offline use.
  exclude: [/.*/],
});

const nextConfig: NextConfig = {};

export default withSerwist(nextConfig);
