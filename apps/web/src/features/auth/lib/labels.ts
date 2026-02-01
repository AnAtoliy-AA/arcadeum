import type { SessionProviderId } from "@/entities/session/model/useSessionTokens";
import type { ProviderCopy } from "../types";

/**
 * Resolves a human-readable label for a session provider
 */
export function resolveProviderLabel(
  provider: SessionProviderId | null | undefined,
  copy: ProviderCopy | undefined,
  fallbackCopy: ProviderCopy | undefined,
): string {
  const providerKey: keyof NonNullable<ProviderCopy> = (provider ?? "guest") as keyof NonNullable<ProviderCopy>;
  const preferred = copy?.[providerKey];
  if (preferred) {
    return preferred;
  }
  const fallback = fallbackCopy?.[providerKey];
  if (fallback) {
    return fallback;
  }

  if (providerKey === "oauth") {
    return provider?.toUpperCase() ?? "OAuth";
  }

  if (typeof providerKey === "string" && providerKey.length > 0) {
    return providerKey.charAt(0).toUpperCase() + providerKey.slice(1);
  }

  return "Guest";
}
