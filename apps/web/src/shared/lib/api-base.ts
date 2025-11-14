const DEFAULT_API_BASE = "http://localhost:4000";

function normalizeBase(value?: string | null): string {
  if (!value) {
    return DEFAULT_API_BASE;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return DEFAULT_API_BASE;
  }

  return trimmed.replace(/\/?$/, "");
}

export function resolveApiBase(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_WEB_API_BASE_URL;
  return normalizeBase(fromEnv);
}

export function resolveApiUrl(path: string): string {
  const base = resolveApiBase();
  if (!path) {
    return base;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const separator = path.startsWith("/") ? "" : "/";
  return `${base}${separator}${path}`;
}
