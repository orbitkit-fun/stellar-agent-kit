/**
 * Next.js instrumentation file — runs once at server startup before any requests.
 * Used to validate required environment variables early so missing vars produce
 * a clear error instead of cryptic runtime failures deep inside route handlers.
 *
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only validate on the server side
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("./lib/env.js");
    validateEnv();
  }
}
