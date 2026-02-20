/**
 * Get headers for Squid Router API requests
 * Squid Router uses public endpoints, but may require integrator ID in the future
 * @param integratorId - Optional integrator ID for future use
 * @returns Headers object
 */
export function getHeaders(integratorId?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Future: Add integrator ID support if Squid requires it
  if (integratorId) {
    headers["X-Integrator-Id"] = integratorId;
  }

  return headers;
}

