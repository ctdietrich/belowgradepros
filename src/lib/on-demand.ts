const DYNAMIC_SERVER_USAGE = "DYNAMIC_SERVER_USAGE";

function databaseErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: unknown }).code;
    if (typeof code === "string" && code) return code;
  }
  return error instanceof Error ? error.name : "unknown";
}

/**
 * Prerender runs these queries at build time. If the database is unreachable,
 * signal dynamic rendering so `next build` succeeds and the route renders on
 * the next request instead of failing the deploy.
 */
export async function withOnDemandFallback<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (process.env.NEXT_PHASE !== "phase-production-build") throw error;
    console.error(
      "[static] database unreachable during build; rendering on demand:",
      databaseErrorCode(error),
    );
    const bailout = new Error(
      "Dynamic server usage: database unreachable during static generation",
    );
    (bailout as Error & { digest: string }).digest = DYNAMIC_SERVER_USAGE;
    throw bailout;
  }
}
