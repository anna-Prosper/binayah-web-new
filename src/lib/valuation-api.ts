function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function deriveBaseUrlFromStreamUrl(streamUrl: string) {
  try {
    const parsed = new URL(streamUrl);
    parsed.pathname = parsed.pathname.replace(/\/stream\/?$/, "");
    return trimTrailingSlash(parsed.toString());
  } catch {
    return trimTrailingSlash(streamUrl.replace(/\/stream\/?$/, ""));
  }
}

export function getValuationApiBaseUrl() {
  const configuredBaseUrl =
    process.env.VALUATION_API_BASE_URL?.trim() ??
    process.env.NEXT_PUBLIC_VALUATION_API_BASE_URL?.trim() ??
    "";

  if (configuredBaseUrl) {
    return trimTrailingSlash(configuredBaseUrl);
  }

  const configuredStreamUrl =
    process.env.VALUATION_API_URL?.trim() ??
    process.env.NEXT_PUBLIC_VALUATION_API_URL?.trim() ??
    "";

  if (!configuredStreamUrl) {
    return "";
  }

  return deriveBaseUrlFromStreamUrl(configuredStreamUrl);
}

export function getValuationApiUrl(path: string) {
  const normalizedPath = path.replace(/^\/+/, "");
  const baseUrl = getValuationApiBaseUrl();

  if (normalizedPath === "stream") {
    const configuredStreamUrl =
      process.env.VALUATION_API_URL?.trim() ??
      process.env.NEXT_PUBLIC_VALUATION_API_URL?.trim() ??
      "";

    if (configuredStreamUrl) {
      return configuredStreamUrl;
    }
  }

  if (!baseUrl) {
    return "";
  }

  return `${baseUrl}/${normalizedPath}`;
}
