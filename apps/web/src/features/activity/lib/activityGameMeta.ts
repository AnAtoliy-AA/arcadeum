import { featuredGames } from '@/app/[locale]/home/data/games';
import type { TranslationKey } from '@/shared/i18n/useTranslation';

export const FALLBACK_GAME_ACCENT = '#38bdf8';

export interface ActivityGameMeta {
  id: string;
  nameKey: TranslationKey | null;
  accent: string;
  landingHref: string | null;
}

const META = new Map<string, ActivityGameMeta>(
  featuredGames.map((g) => [
    g.id,
    {
      id: g.id,
      nameKey: g.nameKey,
      accent: g.accentColor ?? FALLBACK_GAME_ACCENT,
      landingHref: g.landingHref ?? null,
    },
  ]),
);

export function getActivityGameMeta(
  gameId: string | null,
): ActivityGameMeta | null {
  if (!gameId) return null;
  return META.get(gameId) ?? null;
}

/** Games offered in the per-game filter (ones with a landing page). */
export function getFilterableGames(): ActivityGameMeta[] {
  return [...META.values()].filter((g) => g.nameKey && g.landingHref);
}
