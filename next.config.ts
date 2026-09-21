import type { NextConfig } from "next";

/**
 * Permanent host redirect for the stable Vercel project alias only.
 * Unique preview URLs (`belowgradepros-git-*.vercel.app`) stay reachable so PR
 * previews keep working. www→apex and trailing-slash behavior are unchanged.
 */
export const vercelProjectAliasRedirects = [
  {
    source: "/:path*",
    has: [{ type: "host" as const, value: "belowgradepros.vercel.app" }],
    destination: "https://belowgradepros.com/:path*",
    permanent: true,
  },
];

const nextConfig: NextConfig = {
  agentRules: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return vercelProjectAliasRedirects;
  },
};

export default nextConfig;
