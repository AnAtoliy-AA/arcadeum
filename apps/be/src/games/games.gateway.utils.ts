import { Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type {
  ExplodingCatsCard,
  ExplodingCatsCatCard,
  AttackPackCard,
} from './exploding-cats/exploding-cats.state';

export const CAT_COMBO_CARD_VALUES = [
  'tacocat',
  'hairy_potato_cat',
  'rainbow_ralphing_cat',
  'cattermelon',
  'bearded_cat',
] as const satisfies ReadonlyArray<ExplodingCatsCatCard>;

export const ATTACK_PACK_CARDS = [
  'targeted_attack',
  'personal_attack',
  'attack_of_the_dead',
  'super_skip',
  'reverse',
] as const satisfies ReadonlyArray<AttackPackCard>;

export const SIMPLE_ACTION_CARDS = [
  'skip',
  'attack',
  'shuffle',
  'nope',
  ...ATTACK_PACK_CARDS,
] as const;
export type SimpleActionCard = (typeof SIMPLE_ACTION_CARDS)[number];

export const ALL_EXPLODING_CATS_CARDS = [
  'exploding_cat',
  'defuse',
  'attack',
  'skip',
  'favor',
  'shuffle',
  'see_the_future',
  'nope',
  ...CAT_COMBO_CARD_VALUES,
  ...ATTACK_PACK_CARDS,
] as const satisfies ReadonlyArray<ExplodingCatsCard>;

export function isCatComboCard(value: string): value is ExplodingCatsCatCard {
  return CAT_COMBO_CARD_VALUES.includes(value as ExplodingCatsCatCard);
}

export function isSimpleActionCard(value: string): value is SimpleActionCard {
  return SIMPLE_ACTION_CARDS.includes(value as SimpleActionCard);
}

export function toExplodingCatsCard(
  value?: string,
): ExplodingCatsCard | undefined {
  if (!value) {
    return undefined;
  }
  const lower = value.toLowerCase() as ExplodingCatsCard;
  return ALL_EXPLODING_CATS_CARDS.includes(lower) ? lower : undefined;
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

export function extractCatComboPayload(payload: Record<string, unknown>): {
  cat: string;
  mode: 'pair' | 'trio' | 'fiver';
  targetPlayerId?: string;
  desiredCard?: ExplodingCatsCard;
  selectedIndex?: number;
  requestedDiscardCard?: ExplodingCatsCard;
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
    const catCardValue = toExplodingCatsCard(cat);
    if (!catCardValue) {
      throw new WsException('cat is not supported.');
    }
  }

  const desiredCardValue = toExplodingCatsCard(desiredCard);
  const requestedDiscardCardValue = toExplodingCatsCard(requestedDiscardCard);

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
