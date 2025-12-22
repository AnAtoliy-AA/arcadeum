import Constants from 'expo-constants';
import { getAppExtra } from './expoConstants';
import { platform } from '@/constants/platform';

function isLocalHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function extractRemoteHost(candidate?: string): string | undefined {
  if (!candidate) return undefined;
  try {
    const url = new URL(
      candidate.includes('://') ? candidate : `http://${candidate}`,
    );
    return url.hostname;
  } catch {
    const withoutScheme = candidate.replace(/^[a-zA-Z]+:\/\//, '');
    const host = withoutScheme.split(':')[0]?.split('/')[0]?.trim();
    return host || undefined;
  }
}

function pickHostOverride(): string | undefined {
  const extra = getAppExtra();
  const envValue = process.env.EXPO_PUBLIC_ANDROID_DEV_HOST as
    | string
    | undefined;
  const extraValue =
    (extra as import('./expoConstants').AppExpoConfig)?.ANDROID_DEV_HOST ??
    (extra as import('./expoConstants').AppExpoConfig)?.androidDevHost;

  const host = extractRemoteHost(envValue ?? extraValue);
  if (host && !isLocalHost(host)) {
    return host;
  }
  return undefined;
}

function extractHostFromCandidates(
  candidates: (string | undefined)[],
): string | undefined {
  for (const candidate of candidates) {
    const host = extractRemoteHost(candidate);
    if (host && !isLocalHost(host)) {
      return host;
    }
  }
  return undefined;
}

interface ExpoInternalConfig {
  expoGoConfig?: Record<string, unknown>;
  manifest?: Record<string, unknown>;
  manifest2?: {
    extra?: {
      expoGo?: {
        developer?: {
          host?: string;
        };
      };
    };
  };
  expoConfig?: {
    hostUri?: string;
  };
}

function deriveDevServerHost(): string | undefined {
  const expoConfig = Constants as unknown as ExpoInternalConfig;
  const expoGo = expoConfig?.expoGoConfig ?? {};
  const manifest = expoConfig?.manifest ?? {};
  const manifest2 = expoConfig?.manifest2 ?? {};

  return extractHostFromCandidates([
    expoGo.debuggerHost as string | undefined,
    expoGo.hostUri as string | undefined,
    expoGo.url as string | undefined,
    expoConfig?.expoConfig?.hostUri,
    manifest.debuggerHost as string | undefined,
    manifest.hostUri as string | undefined,
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
  const extra = getAppExtra();
  const raw =
    extra.API_BASE_URL ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    'http://localhost:4000';
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
