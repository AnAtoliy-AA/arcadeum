import type { TranslationKey } from '@/shared/i18n/useTranslation';

export interface SoloRuleItem {
  badge: string;
  title: string;
  body: string;
}

export function getSoloRules(
  gameId: string,
  t: (key: TranslationKey) => string,
): SoloRuleItem[] {
  return [
    {
      badge: '🎯',
      title: t('games.soloControls.objective') || 'Objective',
      body: t(`games.${gameId}.rules.objective` as TranslationKey) || '',
    },
    {
      badge: '🎮',
      title: t('games.soloControls.howToPlay') || 'How to Play',
      body: t(`games.${gameId}.rules.gameplay` as TranslationKey) || '',
    },
    {
      badge: '🏆',
      title: t('games.soloControls.scoring') || 'Scoring',
      body: t(`games.${gameId}.rules.scoring` as TranslationKey) || '',
    },
  ].filter((r) => Boolean(r.body));
}

const RULES_ICONS: Record<string, string> = {
  '2048': '🔢',
  Minesweeper: '💣',
  Solitaire: '🃏',
};

export function getRulesIcon(gameName: string): string {
  return RULES_ICONS[gameName] ?? '🧩';
}
