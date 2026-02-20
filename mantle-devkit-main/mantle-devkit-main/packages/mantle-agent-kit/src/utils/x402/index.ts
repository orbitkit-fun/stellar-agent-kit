/**
 * Platform Configuration & Validation
 *
 * Validates APP_ID with Mantle platform API
 */

const DEFAULT_PLATFORM_URL = "https://mantle-devkit.vercel.app";

/** Project configuration from platform */
export interface ProjectConfig {
  appId: string;
  name: string;
  payTo: string;
  network: string;
  status: string;
}

/** Cached configuration (singleton) */
let cachedConfig: ProjectConfig | null = null;
let validationPromise: Promise<ProjectConfig> | null = null;

/**
 * Get platform API base URL
 */
function getPlatformBaseUrl(): string {
  if (typeof process !== "undefined" && process.env) {
    return (
      process.env.PLATFORM_URL ||
      process.env.NEXT_PUBLIC_PLATFORM_URL ||
      DEFAULT_PLATFORM_URL
    );
  }
  return DEFAULT_PLATFORM_URL;
}

/**
 * Validate APP_ID with platform API
 */
async function validateAppId(appId: string): Promise<ProjectConfig> {
  const baseUrl = getPlatformBaseUrl();
  const url = `${baseUrl}/api/v1/validate?appId=${encodeURIComponent(appId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        "Platform: Project not found. Invalid APP_ID. Please check your APP_ID configuration.",
      );
    }
    if (response.status === 401) {
      throw new Error(
        "Platform: Unauthorized. Invalid APP_ID. Please verify your APP_ID.",
      );
    }
    throw new Error(
      `Platform: Validation failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ProjectConfig;

  if (!data.appId || !data.payTo || !data.network) {
    throw new Error("Platform: Invalid response - missing required fields");
  }

  if (data.status !== "ACTIVE") {
    throw new Error(
      `Platform: Project is not active. Current status: ${data.status}`,
    );
  }

  return {
    appId: data.appId,
    name: data.name,
    payTo: data.payTo,
    network: data.network,
    status: data.status,
  };
}

/**
 * Initialize platform validation
 *
 * Reads APP_ID from environment and validates with platform API.
 * Uses singleton pattern - multiple calls return same promise.
 *
 * @returns Project configuration from platform
 * @throws Error if APP_ID is not set or validation fails
 */
export async function initializePlatform(): Promise<ProjectConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  if (validationPromise) {
    return validationPromise;
  }

  let appId: string | undefined;
  if (typeof process !== "undefined" && process.env) {
    appId = process.env.APP_ID || process.env.NEXT_PUBLIC_APP_ID;
  }

  if (!appId || typeof appId !== "string" || appId.trim().length === 0) {
    throw new Error(
      "APP_ID is required. Set it in your .env file:\nAPP_ID=your_app_id_here",
    );
  }

  validationPromise = validateAppId(appId.trim());

  try {
    cachedConfig = await validationPromise;
    return cachedConfig;
  } catch (error) {
    validationPromise = null;
    throw error;
  }
}

/**
 * Get cached project configuration
 *
 * @throws Error if platform not initialized
 */
export function getProjectConfig(): ProjectConfig {
  if (!cachedConfig) {
    throw new Error(
      "Platform not initialized. Call initializePlatform() first.",
    );
  }
  return cachedConfig;
}

/**
 * Clear cached configuration (for testing)
 */
export function clearCache(): void {
  cachedConfig = null;
  validationPromise = null;
}
