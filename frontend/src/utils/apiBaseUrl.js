const DEFAULT_API_PROXY_PATH = "/api";

export function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return DEFAULT_API_PROXY_PATH;
  }

  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    configuredBaseUrl.startsWith("http://")
  ) {
    return DEFAULT_API_PROXY_PATH;
  }

  return configuredBaseUrl;
}
