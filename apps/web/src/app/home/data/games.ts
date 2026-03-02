import { TranslationKey } from '@/shared/lib/useTranslation';

export interface FeaturedGame {
  id: string;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  emoji: string;
  gradient: string;
  tags: string[];
  isPlayable: boolean;
  route: string;
  type: 'card' | 'board';
  rulesPrefix: string;
  rulesKeys: string[];
  variableKeys?: Record<string, TranslationKey>;
  variants: Array<{ id: string; nameKey: TranslationKey; disabled?: boolean }>;
}

import { CARD_VARIANTS } from '@/app/games/create/constants';
import { SEA_BATTLE_VARIANTS } from '@/widgets/SeaBattleGame/lib/constants';

export const featuredGames: FeaturedGame[] = [
  {
    id: 'critical_v1',
    nameKey: 'games.critical_v1.name' as TranslationKey,
    descriptionKey: 'games.critical_v1.description' as TranslationKey,
    emoji: '💣',
    gradient: 'linear-gradient(135deg, #FF4D4D 0%, #F9CB28 100%)',
    tags: ['Card Game', '3-5 Players', '15m Match', 'Strategy'],
    isPlayable: true,
    route: '/games',
    type: 'card',
    rulesPrefix: 'games.critical_v1.rules',
    rulesKeys: ['objective', 'gameplay', 'combos', 'setup'],
    variableKeys: {
      criticalEvent: 'games.table.cards.criticalEvent' as TranslationKey,
      neutralizer: 'games.table.cards.neutralizer' as TranslationKey,
    },
    variants: CARD_VARIANTS.map((v) => ({
      id: v.id,
      nameKey: v.name as TranslationKey,
      disabled: v.disabled,
    })),
  },
  {
    id: 'sea_battle_v1',
    nameKey: 'games.sea_battle_v1.name' as TranslationKey,
    descriptionKey: 'games.sea_battle_v1.description' as TranslationKey,
    emoji: '🚢',
    gradient: 'linear-gradient(135deg, #3498db 0%, #1abc9c 100%)',
    tags: ['Board Game', '2-6 Players', '10m Match', 'Strategy'],
    isPlayable: true,
    route: '/games',
    type: 'board',
    rulesPrefix: 'games.sea_battle_v1.rules',
    rulesKeys: ['objective', 'gameplay', 'placement', 'battle'],
    variants: SEA_BATTLE_VARIANTS.map((v) => ({
      id: v.id,
      nameKey: v.name as TranslationKey,
    })),
  },
];
