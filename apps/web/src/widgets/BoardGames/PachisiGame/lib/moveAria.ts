import type { TranslationKey } from '@/shared/i18n/useTranslation';
import type { PachisiToken } from '../types';
import { destinationOf } from './boardLayout';

export interface MoveAria {
  key: TranslationKey;
  params: Record<string, number>;
}

const BASE = 'games.pachisi_v1.game' as const;

/** Translation key and params describing a token's move for screen readers. */
export function moveAriaFor(
  seat: number,
  token: PachisiToken,
  die: number | null,
): MoveAria {
  const dest = destinationOf(seat, token, die);
  const id = token.id;
  if (!dest) return { key: `${BASE}.moveTokenAria`, params: { id } };
  if (token.progress < 0) {
    return { key: `${BASE}.moveTokenFromYardAria`, params: { id } };
  }
  if (dest.kind === 'home') {
    return { key: `${BASE}.moveTokenHomeAria`, params: { id } };
  }
  if (dest.kind === 'lane') {
    return { key: `${BASE}.moveTokenLaneAria`, params: { id } };
  }
  if (dest.fromCell === null) {
    return { key: `${BASE}.moveTokenAria`, params: { id } };
  }
  return {
    key: `${BASE}.moveTokenToCellAria`,
    params: { id, from: dest.fromCell + 1, to: dest.cell + 1 },
  };
}
