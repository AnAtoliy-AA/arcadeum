import Constants from 'expo-constants';
import { platform } from '@/constants/platform';

function isLocalHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function extractRemoteHost(candidate?: string): string | undefined {
  if (!candidate) return undefined;
  try {
    const url = new URL(candidate.includes('://') ? candidate : `http://${candidate}`);
    return url.hostname;
  } catch {
    const withoutScheme = candidate.replace(/^[a-zA-Z]+:\/\//, '');
    const host = withoutScheme.split(':')[0]?.split('/')[0]?.trim();
    return host || undefined;
  }
}

function pickHostOverride(): string | undefined {
  const extra = (Constants as any)?.expoConfig?.extra as Record<string, unknown> | undefined;
  const envValue = process.env.EXPO_PUBLIC_ANDROID_DEV_HOST as string | undefined;
  const extraValue = (extra?.ANDROID_DEV_HOST as string | undefined) ?? (extra?.androidDevHost as string | undefined);

  const host = extractRemoteHost(envValue ?? extraValue);
  if (host && !isLocalHost(host)) {
    return host;
  }
  return undefined;
}

function extractHostFromCandidates(candidates: (string | undefined)[]): string | undefined {
  for (const candidate of candidates) {
    const host = extractRemoteHost(candidate);
    if (host && !isLocalHost(host)) {
      return host;
    }
  }
  return undefined;
}

function deriveDevServerHost(): string | undefined {
  const expoConfig = Constants as any;
  const expoGo = expoConfig?.expoGoConfig ?? {};
  const manifest = expoConfig?.manifest ?? {};
  const manifest2 = expoConfig?.manifest2 ?? {};

  return extractHostFromCandidates([
    expoGo.debuggerHost,
    expoGo.hostUri,
    expoGo.url,
    expoConfig?.expoConfig?.hostUri,
    manifest.debuggerHost,
    manifest.hostUri,
    manifest2?.extra?.expoGo?.developer?.host,
  ]);
}

function resolveDeviceAwareBase(urlString: string): string {
  try {
    const parsed = new URL(urlString);
    if (!isLocalHost(parsed.hostname)) {
      return urlString;
    }

    const overrideHost = pickHostOverride();
    if (overrideHost) {
      parsed.hostname = overrideHost;
      return parsed.toString().replace(/\/$/, '');
    }

    const hostOverride = deriveDevServerHost();
    if (hostOverride) {
      parsed.hostname = hostOverride;
      return parsed.toString().replace(/\/$/, '');
    }

    if (platform.isAndroid) {
      parsed.hostname = '10.0.2.2';
      return parsed.toString().replace(/\/$/, '');
    }
  } catch {
    // Ignore parse errors and fall through to original string
  }
  return urlString;
}

export function resolveApiBase(): string {
  const extra = (Constants as any)?.expoConfig?.extra as Record<string, any> | undefined;
  const raw = (extra?.API_BASE_URL as string | undefined) || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const normalized = raw.replace(/\/$/, '');

  if (!platform.isNative) {
    return normalized;
  }

  return resolveDeviceAwareBase(normalized);
}

export function resolveApiUrl(path: string): string {
  const base = resolveApiBase();
  if (!path) return base;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const separator = path.startsWith('/') ? '' : '/';
  return `${base}${separator}${path}`;
}
