import { withPostHogConfig } from "@posthog/nextjs-config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "export",
};

export default withPostHogConfig(nextConfig, {
  personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY ?? "",
  envId: "276396",
  host: "https://us.i.posthog.com",
  sourcemaps: {
    enabled: true,
    project: "acadia-one-web",
    version: "1.0.0",
    deleteAfterUpload: true,
  },
});
