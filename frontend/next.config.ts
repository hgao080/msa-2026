import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  ...(process.env.WATCHPACK_POLLING === "true" && {
    watchOptions: { pollIntervalMs: 300 },
  }),
};

export default nextConfig;
