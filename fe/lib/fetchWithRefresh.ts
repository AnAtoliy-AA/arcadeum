import type { SessionTokensSnapshot } from '@/stores/sessionTokens';
import type { TranslationKey } from '@/lib/i18n/messages';
import { findApiMessageDescriptor } from '@/lib/apiMessageCatalog';
import { emitGlobalError, type GlobalErrorPayload } from '@/lib/globalErrorHandler';

export interface FetchWithRefreshOptions {
  accessToken?: string | null;
  refreshTokens?: () => Promise<SessionTokensSnapshot>;
}

async function performFetch(
  url: string,
  init: RequestInit,
  accessToken?: string | null,
): Promise<Response> {
  const headers = new Headers(init.headers as HeadersInit | undefined);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return fetch(url, { ...init, headers });
}

export async function fetchWithRefresh(
  url: string,
  init: RequestInit = {},
  options: FetchWithRefreshOptions = {},
): Promise<Response> {
  const { accessToken, refreshTokens } = options;
  const firstResponse = await performFetch(url, init, accessToken ?? undefined);

  if (firstResponse.status !== 401 || !refreshTokens) {
    if (!firstResponse.ok) {
      notifyResponseError(firstResponse);
    }
    return firstResponse;
  }

  try {
    const refreshed = await refreshTokens();
    const nextToken = refreshed.accessToken;
    if (!nextToken || nextToken === accessToken) {
      if (!firstResponse.ok) {
        notifyResponseError(firstResponse);
      }
      return firstResponse;
    }
    const retryResponse = await performFetch(url, init, nextToken);
    if (!retryResponse.ok) {
      notifyResponseError(retryResponse);
    }
    return retryResponse;
  } catch {
    if (!firstResponse.ok) {
      notifyResponseError(firstResponse);
    }
    return firstResponse;
  }
}

function notifyResponseError(response: Response) {
  const clone = response.clone();
  void (async () => {
    const payload = await extractErrorPayload(clone);
    const fallback =
      payload.fallbackMessage ?? payload.rawMessage ?? `Request failed (${response.status})`;
    emitGlobalError({
      ...payload,
      fallbackMessage: fallback,
    });
  })();
}

async function extractErrorPayload(response: Response): Promise<GlobalErrorPayload> {
  try {
    const raw = await response.text();
    const trimmed = raw.trim();
    if (!trimmed) {
      return {};
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return { rawMessage: trimmed, fallbackMessage: trimmed };
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
      return { rawMessage: trimmed, fallbackMessage: trimmed };
    }

    const messageCode = normalizeMessageCode(parsed?.messageCode);
    const messageKey = readString(parsed?.messageKey);
    const message = pickFirstString(
      parsed?.message,
      parsed?.error,
      parsed?.detail,
      parsed?.title,
    );

    const descriptor = findApiMessageDescriptor({
      code: messageCode,
      messageKey,
      message,
    });

    const fallbackDetail = extractFallbackMessage(parsed?.details);

    return {
      translationKey:
        descriptor?.translationKey ?? inferTranslationKeyFromMessageKey(messageKey),
      fallbackMessage: fallbackDetail ?? descriptor?.fallbackMessage ?? message,
      rawMessage: shouldExposeRawMessage(message) ? message : undefined,
    };
  } catch {
    return {};
  }
}

function normalizeMessageCode(raw: unknown): number | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === 'string') {
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function readString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

function pickFirstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    const normalized = normalizeToString(value);
    if (normalized) {
      return normalized;
    }
  }
  return undefined;
}

function normalizeToString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
    if (parts.length > 0) {
      return parts.join(', ');
    }
  }

  return undefined;
}

function extractFallbackMessage(details: unknown): string | undefined {
  if (!details || typeof details !== 'object') {
    return undefined;
  }

  const record = details as Record<string, unknown>;
  return normalizeToString(record.fallbackMessage);
}

function inferTranslationKeyFromMessageKey(messageKey?: string): TranslationKey | undefined {
  if (!messageKey || !/^[a-z]+(\.[a-zA-Z0-9]+)+$/.test(messageKey)) {
    return undefined;
  }
  return `api.${messageKey}` as TranslationKey;
}

function shouldExposeRawMessage(message?: string): boolean {
  if (!message) {
    return false;
  }
  // Hide raw message keys like "payments.invalidAmount" from the toast UI.
  return /\s/.test(message);
}
