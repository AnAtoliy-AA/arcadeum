/**
 * Utility functions for the auth module.
 */
import type { ParsedRedirectEntry } from './types';

/**
 * Escape special regex characters in a string.
 */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sanitize a string value by trimming whitespace.
 * Returns undefined if the value is empty or null.
 */
export function sanitize(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Normalize a URL string.
 * Returns null if the URL is invalid.
 */
export function normalizeUrl(value: string): string | null {
  try {
    return new URL(value).toString();
  } catch {
    return null;
  }
}

/**
 * Parse a comma or newline separated list of redirect URIs.
 */
export function parseRedirectList(value?: string | null): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

/**
 * Parse a single redirect URI entry.
 * Supports wildcard notation (e.g., "https://example.com/*").
 */
export function parseRedirectEntry(raw: string): ParsedRedirectEntry | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const wildcard = trimmed.endsWith('/*');
  const candidate = wildcard ? trimmed.slice(0, -2) : trimmed;

  const normalized = normalizeUrl(candidate);
  if (!normalized) {
    return null;
  }

  try {
    const url = new URL(normalized);
    const origin = url.origin;
    if (wildcard) {
      return { origin } satisfies ParsedRedirectEntry;
    }
    return { exact: url.toString(), origin } satisfies ParsedRedirectEntry;
  } catch {
    return null;
  }
}
