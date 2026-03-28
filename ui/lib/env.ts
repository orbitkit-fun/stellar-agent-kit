/**
 * Environment variable validation for the Stellar Agent Kit UI.
 *
 * Fixes issue #4: previously, missing env vars caused cryptic runtime errors
 * deep inside route handlers (e.g. "Cannot read properties of undefined" from
 * getSupabaseAdmin()). This module validates all required variables at startup
 * and fails fast with a clear, actionable error message.
 *
 * Usage: import "./lib/env.js" at the top of your Next.js instrumentation file
 * or in any server-side entry point.
 */

/** Variables required for the app to function at all. */
const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

/** Variables that are required only in production. */
const REQUIRED_IN_PRODUCTION = [
  "DODO_PAYMENTS_API_KEY",
  "DODO_PAYMENTS_WEBHOOK_SECRET",
  "ADMIN_SECRET",
  "SECRET_KEY",
] as const;

/** Variables that are optional but should be noted if missing. */
const OPTIONAL_ENV_VARS = [
  "GROQ_API_KEY",
  "OPENAI_API_KEY",
  "SOROSWAP_API_KEY",
  "NEXT_PUBLIC_APP_URL",
  "STELLAR_DEVKIT_APP_ID",
  "DODO_PAYMENTS_ENVIRONMENT",
  "DODO_PAYMENTS_PRODUCT_BUILDER",
  "DODO_PAYMENTS_PRODUCT_PRO",
] as const;

type RequiredVar = (typeof REQUIRED_ENV_VARS)[number];
type ProductionVar = (typeof REQUIRED_IN_PRODUCTION)[number];

/**
 * Validate environment variables at startup.
 * Throws with a clear message listing all missing variables.
 * Call once at server startup before handling any requests.
 */
export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === "production";

  // Check always-required vars
  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Check production-only required vars
  if (isProduction) {
    for (const key of REQUIRED_IN_PRODUCTION) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }
  }

  // Warn about missing optional vars
  for (const key of OPTIONAL_ENV_VARS) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  if (missing.length > 0) {
    const list = missing.map((k) => `  - ${k}`).join("\n");
    throw new Error(
      `[stellar-agent-kit-ui] Missing required environment variables:\n${list}\n\n` +
        `Copy ui/.env.example to ui/.env.local and fill in the missing values.`
    );
  }

  if (warnings.length > 0 && isProduction) {
    console.warn(
      `[stellar-agent-kit-ui] Optional env vars not set (some features may be unavailable):\n` +
        warnings.map((k) => `  - ${k}`).join("\n")
    );
  }
}

/**
 * Get a required environment variable. Throws if missing.
 * Use this in route handlers to get typed env var access with a clear error.
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[stellar-agent-kit-ui] Missing required environment variable: ${key}\n` +
        `Set it in ui/.env.local before starting the server.`
    );
  }
  return value;
}

/**
 * Get an optional environment variable. Returns undefined if missing.
 */
export function optionalEnv(key: string): string | undefined {
  return process.env[key];
}
