import { Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import {
  CriticalCard,
  CriticalCollectionCard,
  COLLECTION_CARDS,
  ATTACK_PACK_CARDS,
  FUTURE_PACK_CARDS,
  THEFT_PACK_CARDS,
  CHAOS_PACK_CARDS,
} from './critical/critical.state';

export const SIMPLE_ACTION_CARDS = [
  'evade',
  'strike',
  'reorder',
  'cancel',
  ...ATTACK_PACK_CARDS,
  ...FUTURE_PACK_CARDS,
  ...THEFT_PACK_CARDS,
  'fission',
  'tribute',
  'blackout',
  'unstash',
] as const;
export type SimpleActionCard = (typeof SIMPLE_ACTION_CARDS)[number];

export const ALL_CRITICAL_CARDS = [
  'critical_event',
  'neutralizer',
  'strike',
  'evade',
  'trade',
  'reorder',
  'insight',
  'cancel',
  ...COLLECTION_CARDS,
  ...ATTACK_PACK_CARDS,
  ...FUTURE_PACK_CARDS,
  ...THEFT_PACK_CARDS,
  ...CHAOS_PACK_CARDS,
] as const satisfies ReadonlyArray<CriticalCard>;

export function isCollectionComboCard(
  value: string,
): value is CriticalCollectionCard {
  return COLLECTION_CARDS.includes(value as CriticalCollectionCard);
}

export function isSimpleActionCard(value: string): value is SimpleActionCard {
  return SIMPLE_ACTION_CARDS.includes(value as SimpleActionCard);
}

export function toCriticalCard(value?: string): CriticalCard | undefined {
  if (!value) {
    return undefined;
  }
  const lower = value.toLowerCase() as CriticalCard;
  return ALL_CRITICAL_CARDS.includes(lower) ? lower : undefined;
}

/**
 * Validates and extracts string payload field
 */
export function extractString(
  payload: Record<string, unknown>,
  fieldName: string,
  options?: { toLowerCase?: boolean },
): string {
  const value =
    typeof payload?.[fieldName] === 'string' ? payload[fieldName].trim() : '';

  if (!value) {
    throw new WsException(`${fieldName} is required.`);
  }

  return options?.toLowerCase ? value.toLowerCase() : value;
}

/**
 * Validates room and user IDs from payload
 */
export function extractRoomAndUser(payload: Record<string, unknown>): {
  roomId: string;
  userId: string;
} {
  return {
    roomId: extractString(payload, 'roomId'),
    userId: extractString(payload, 'userId'),
  };
}

/**
 * Handles common error logging and wrapping
 */
export function handleError(
  logger: Logger,
  error: unknown,
  context: { action: string; roomId: string; userId: string },
  defaultMessage: string,
): never {
  const message =
    error instanceof Error && typeof error.message === 'string'
      ? error.message
      : defaultMessage;

  logger.warn(
    `Failed to ${context.action} for room ${context.roomId}, user ${context.userId}: ${message}`,
  );

  throw new WsException(message);
}

export function extractCollectionComboPayload(
  payload: Record<string, unknown>,
): {
  cat: string;
  mode: 'pair' | 'trio' | 'fiver';
  targetPlayerId?: string;
  desiredCard?: CriticalCard;
  selectedIndex?: number;
  requestedDiscardCard?: CriticalCard;
  cards?: string[];
} {
  const modeRaw = extractString(payload, 'mode', { toLowerCase: true });

  const catRaw = payload?.cat;
  const cat = typeof catRaw === 'string' ? catRaw.trim().toLowerCase() : '';

  const targetIdRaw = payload?.targetPlayerId;
  const targetPlayerId =
    typeof targetIdRaw === 'string' ? targetIdRaw.trim() : undefined;

  const desiredCardRaw = payload?.desiredCard;
  const desiredCard =
    typeof desiredCardRaw === 'string'
      ? desiredCardRaw.trim().toLowerCase()
      : undefined;

  const selectedIndexRaw = payload?.selectedIndex;
  const selectedIndex =
    typeof selectedIndexRaw === 'number' ? selectedIndexRaw : undefined;

  const requestedDiscardCardRaw = payload?.requestedDiscardCard;
  const requestedDiscardCard =
    typeof requestedDiscardCardRaw === 'string'
      ? requestedDiscardCardRaw.trim().toLowerCase()
      : undefined;

  const cardsRaw = payload?.cards;
  const cards = Array.isArray(cardsRaw)
    ? cardsRaw.map((c: unknown) => String(c).trim().toLowerCase())
    : undefined;

  const validModes = ['pair', 'trio', 'fiver'] as const;
  if (!validModes.includes(modeRaw as (typeof validModes)[number])) {
    throw new WsException('mode is required.');
  }
  const mode = modeRaw as 'pair' | 'trio' | 'fiver';

  // Fiver mode doesn't require a cat card selection - it uses any 5 different cards
  if (mode !== 'fiver') {
    const catCardValue = toCriticalCard(cat);
    if (!catCardValue) {
      throw new WsException('cat is not supported.');
    }
  }

  const desiredCardValue = toCriticalCard(desiredCard);
  const requestedDiscardCardValue = toCriticalCard(requestedDiscardCard);

  if (mode === 'trio' && !desiredCardValue) {
    throw new WsException('desiredCard is required for trio combos.');
  }

  if (mode === 'pair' && selectedIndex === undefined) {
    throw new WsException('selectedIndex is required for pair combos.');
  }

  if (mode === 'fiver' && !requestedDiscardCardValue) {
    throw new WsException('requestedDiscardCard is required for fiver combos.');
  }

  return {
    cat,
    mode,
    targetPlayerId,
    desiredCard: desiredCardValue,
    selectedIndex,
    requestedDiscardCard: requestedDiscardCardValue,
    cards,
  };
}

export function extractPlayActionPayload(payload: Record<string, unknown>): {
  card: string;
  targetPlayerId?: string;
  cardsToStash?: string[];
  cardsToUnstash?: string[];
} {
  const card = extractString(payload, 'card', { toLowerCase: true });
  const targetPlayerId =
    typeof payload?.targetPlayerId === 'string'
      ? payload.targetPlayerId.trim()
      : undefined;

  const cardsToStashRaw = payload?.cardsToStash;
  const cardsToStash = Array.isArray(cardsToStashRaw)
    ? cardsToStashRaw.map((c: unknown) => String(c).trim().toLowerCase())
    : undefined;

  const cardsToUnstashRaw = payload?.cardsToUnstash;
  const cardsToUnstash = Array.isArray(cardsToUnstashRaw)
    ? cardsToUnstashRaw.map((c: unknown) => String(c).trim().toLowerCase())
    : undefined;

  return {
    card,
    targetPlayerId,
    cardsToStash,
    cardsToUnstash,
  };
}
