import { Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type {
  ExplodingCatsCard,
  ExplodingCatsCatCard,
} from './exploding-cats/exploding-cats.state';

export const CAT_COMBO_CARD_VALUES = [
  'tacocat',
  'hairy_potato_cat',
  'rainbow_ralphing_cat',
  'cattermelon',
  'bearded_cat',
] as const satisfies ReadonlyArray<ExplodingCatsCatCard>;

export const SIMPLE_ACTION_CARDS = [
  'skip',
  'attack',
  'shuffle',
  'nope',
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
