import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { absoluteUrl, cityPath, PRODUCTION_SITE_URL, resolveSiteUrl, site } from "./config";
import { buildHomepageStrip } from "./hubs";

const ENV_KEYS = ["NEXT_PUBLIC_SITE_URL", "VERCEL_URL", "VERCEL_ENV"] as const;

const previous = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function setEnv(env: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>) {
  for (const key of ENV_KEYS) {
    const value = env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = previous[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("NEXT_PUBLIC_SITE_URL wins over VERCEL_URL, including on production", () => {
  setEnv({
    NEXT_PUBLIC_SITE_URL: "https://belowgradepros.com",
    VERCEL_URL: "belowgradepros-preview-ctdietrich-2642s-projects.vercel.app",
    VERCEL_ENV: "production",
  });
  assert.equal(resolveSiteUrl(), PRODUCTION_SITE_URL);
  assert.equal(site.url, PRODUCTION_SITE_URL);
});

test("Vercel Production never uses VERCEL_URL when public env is unset", () => {
  setEnv({
    NEXT_PUBLIC_SITE_URL: undefined,
    VERCEL_URL: "belowgradepros-j2wj59ow2-ctdietrich-2642s-projects.vercel.app",
    VERCEL_ENV: "production",
  });
  assert.equal(resolveSiteUrl(), PRODUCTION_SITE_URL);
  assert.equal(absoluteUrl("/sitemap.xml"), "https://belowgradepros.com/sitemap.xml");
  assert.equal(absoluteUrl("/robots.txt"), "https://belowgradepros.com/robots.txt");
});

test("preview may use VERCEL_URL when NEXT_PUBLIC_SITE_URL is unset", () => {
  setEnv({
    NEXT_PUBLIC_SITE_URL: undefined,
    VERCEL_URL: "belowgradepros-git-main-ctdietrich-2642s-projects.vercel.app",
    VERCEL_ENV: "preview",
  });
  assert.equal(resolveSiteUrl(), "https://belowgradepros-git-main-ctdietrich-2642s-projects.vercel.app");
});

test("hard-defaults to belowgradepros.com when no URL env is set", () => {
  setEnv({
    NEXT_PUBLIC_SITE_URL: undefined,
    VERCEL_URL: undefined,
    VERCEL_ENV: undefined,
  });
  assert.equal(resolveSiteUrl(), PRODUCTION_SITE_URL);
});

test("city hub sitemap paths are bare /cities/{slug} with no service query", () => {
  setEnv({
    NEXT_PUBLIC_SITE_URL: "https://belowgradepros.com",
    VERCEL_URL: undefined,
    VERCEL_ENV: "production",
  });
  const loc = absoluteUrl(cityPath("tampa"));
  assert.equal(loc, "https://belowgradepros.com/cities/tampa");
  assert.equal(new URL(loc).search, "");
  assert.ok(cityPath("tampa", "encapsulation").includes("?service="));
});

test("public site copy is evergreen", () => {
  assert.equal(site.email, "hello@belowgradepros.com");
  assert.doesNotMatch(site.description, /Wave 1|stubbed|this season|Stripe keys|WIP/i);
});

test("homepage strip uses human hub names even if DB name is a slug", () => {
  const strip = buildHomepageStrip([
    { slug: "tampa", name: "tampa", state: "fl", region: "gulf", listings: [] },
    { slug: "dallas-fort-worth", name: "dallas-fort-worth", state: "tx", region: "north", listings: [] },
  ]);
  assert.equal(strip[0].name, "Tampa");
  assert.equal(strip.find((city) => city.slug === "dallas-fort-worth")?.name, "Dallas–Fort Worth");
});

test("Vercel project alias redirects to belowgradepros.com and leaves unique previews alone", async () => {
  const { default: nextConfig, vercelProjectAliasRedirects } = await import("../../next.config.ts");
  assert.equal(vercelProjectAliasRedirects.length, 1);
  const rule = vercelProjectAliasRedirects[0];
  assert.equal(rule.source, "/:path*");
  assert.equal(rule.destination, "https://belowgradepros.com/:path*");
  assert.equal(rule.permanent, true);
  assert.deepEqual(rule.has, [{ type: "host", value: "belowgradepros.vercel.app" }]);
  assert.ok(
    !vercelProjectAliasRedirects.some((item) =>
      item.has?.some((condition) => condition.value?.includes("*.vercel.app")),
    ),
  );
  const fromConfig = await nextConfig.redirects?.();
  assert.deepEqual(fromConfig, vercelProjectAliasRedirects);
});
