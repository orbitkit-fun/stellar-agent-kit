/**
 * Get headers for OpenOcean API requests
 * OpenOcean currently uses public endpoints without authentication
 * This helper is prepared for future API key support if needed
 * @param apiKey - Optional API key for future use
 * @returns Headers object
 */
export function getHeaders(apiKey?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Future: Add API key support if OpenOcean introduces authentication
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  return headers;
}

