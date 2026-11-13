import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["@browserbasehq/stagehand"],
  outputFileTracingIncludes: {
    "/api/**": [
      "./node_modules/@browserbasehq/stagehand/dist/assets/stagehand-extension.zip",
    ],
  },
}

export default nextConfig
