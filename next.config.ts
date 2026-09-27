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

/** `/badge/:slug.svg` is the embed URL. The handler lives off that path so the HTML page can use `/badge/:slug`. */
export const foundingBadgeRewrites = [
  {
    source: "/badge/:slug.svg",
    destination: "/badge/svg/:slug",
  },
];

const nextConfig: NextConfig = {
  agentRules: false,
  serverExternalPackages: ["nodemailer"],
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
  async rewrites() {
    return foundingBadgeRewrites;
  },
};

export default nextConfig;
