import type { TranslationKey } from '@/lib/i18n/messages';
import type { ApiMessageDescriptor } from './types';
import { genericDescriptors } from './descriptors/generic';
import { paymentsDescriptors } from './descriptors/payments';
import { gamesDescriptors } from './descriptors/games';
import { gamesWsDescriptors } from './descriptors/gamesWs';
import { authDescriptors } from './descriptors/auth';
import { chatDescriptors } from './descriptors/chat';

const DESCRIPTORS: ApiMessageDescriptor[] = [
  ...genericDescriptors,
  ...paymentsDescriptors,
  ...gamesDescriptors,
  ...gamesWsDescriptors,
  ...authDescriptors,
  ...chatDescriptors,
];

const CODE_LOOKUP: Record<number, ApiMessageDescriptor> = {};
const ALIAS_LOOKUP: Record<string, ApiMessageDescriptor> = {};

function registerAlias(alias: string, descriptor: ApiMessageDescriptor) {
  const trimmed = alias.trim();
  if (!trimmed) {
    return;
  }

  ALIAS_LOOKUP[trimmed] = descriptor;
  ALIAS_LOOKUP[trimmed.toLowerCase()] = descriptor;
}

for (const descriptor of DESCRIPTORS) {
  CODE_LOOKUP[descriptor.code] = descriptor;
  descriptor.aliases?.forEach((alias) => {
    registerAlias(alias, descriptor);
  });

  registerAlias(String(descriptor.code), descriptor);
}

function findByAlias(candidate: unknown): ApiMessageDescriptor | undefined {
  if (typeof candidate !== 'string') {
    return undefined;
  }

  const trimmed = candidate.trim();
  if (!trimmed) {
    return undefined;
  }

  return ALIAS_LOOKUP[trimmed] ?? ALIAS_LOOKUP[trimmed.toLowerCase()];
}

export function findApiMessageDescriptor(params: {
  code?: unknown;
  messageKey?: unknown;
  message?: unknown;
}): ApiMessageDescriptor | undefined {
  if (typeof params.code === 'number') {
    const found = CODE_LOOKUP[params.code];
    if (found) {
      return found;
    }
  }

  const byKey = findByAlias(params.messageKey);
  if (byKey) {
    return byKey;
  }

  const byMessage = findByAlias(params.message);
  if (byMessage) {
    return byMessage;
  }

  return undefined;
}

export function getApiMessageDescriptorByCode(
  code?: number | null,
): ApiMessageDescriptor | undefined {
  if (typeof code !== 'number') {
    return undefined;
  }
  return CODE_LOOKUP[code];
}

export function inferTranslationKeyFromMessageKey(
  messageKey?: string,
): TranslationKey | undefined {
  if (typeof messageKey !== 'string') {
    return undefined;
  }

  const trimmed = messageKey.trim();
  if (!trimmed) {
    return undefined;
  }

  if (!/^[a-z]+(\.[a-zA-Z0-9]+)+$/.test(trimmed.replace(/^api\./, ''))) {
    return undefined;
  }

  if (trimmed.startsWith('api.')) {
    return trimmed as TranslationKey;
  }

  return `api.${trimmed}` as TranslationKey;
}
