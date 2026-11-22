'use client';

import { useMemo } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import {
  LobbyOptionSection,
  LobbyChipGroup,
} from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import type {
  BackgammonOptions,
  BackgammonMode,
  BackgammonTheme,
} from '../types';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

export const BACKGAMMON_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  buttonGradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
};

export const MODE_OPTIONS: Array<{
  id: BackgammonMode;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  emoji: string;
}> = [
  {
    id: 'standard',
    nameKey:
      'games.backgammon_v1.lobby.ruleVariants.standard.name' as TranslationKey,
    descriptionKey:
      'games.backgammon_v1.lobby.ruleVariants.standard.description' as TranslationKey,
    emoji: '🎲',
  },
  {
    id: 'long',
    nameKey:
      'games.backgammon_v1.lobby.ruleVariants.long.name' as TranslationKey,
    descriptionKey:
      'games.backgammon_v1.lobby.ruleVariants.long.description' as TranslationKey,
    emoji: '🏃',
  },
  {
    id: 'hyper',
    nameKey:
      'games.backgammon_v1.lobby.ruleVariants.hyper.name' as TranslationKey,
    descriptionKey:
      'games.backgammon_v1.lobby.ruleVariants.hyper.description' as TranslationKey,
    emoji: '⚡',
  },
  {
    id: 'tavla',
    nameKey:
      'games.backgammon_v1.lobby.ruleVariants.tavla.name' as TranslationKey,
    descriptionKey:
      'games.backgammon_v1.lobby.ruleVariants.tavla.description' as TranslationKey,
    emoji: '🇹🇷',
  },
  {
    id: 'nackgammon',
    nameKey:
      'games.backgammon_v1.lobby.ruleVariants.nackgammon.name' as TranslationKey,
    descriptionKey:
      'games.backgammon_v1.lobby.ruleVariants.nackgammon.description' as TranslationKey,
    emoji: '🧠',
  },
  {
    id: 'gulbara',
    nameKey:
      'games.backgammon_v1.lobby.ruleVariants.gulbara.name' as TranslationKey,
    descriptionKey:
      'games.backgammon_v1.lobby.ruleVariants.gulbara.description' as TranslationKey,
    emoji: '🏛️',
  },
];

export function resolveBackgammonLobbyOptions(raw: unknown): BackgammonOptions {
  const r = (raw ?? {}) as Partial<{
    theme: string;
    variant: string;
    mode: string;
    aiDifficulty: string;
  }>;
  return {
    theme: (r.theme ?? r.variant ?? 'cyberpunk') as BackgammonTheme,
    variant: (r.theme ?? r.variant ?? 'cyberpunk') as BackgammonTheme,
    mode: (r.mode ?? 'standard') as BackgammonMode,
    aiDifficulty: (r.aiDifficulty ?? 'medium') as
      'easy' | 'medium' | 'hard' | 'expert',
  };
}

export function BackgammonLobbyOptionsPanel({
  options,
  roomId,
  userId,
  isHost,
}: {
  options: BackgammonOptions;
  roomId: string;
  userId: string;
  isHost: boolean;
}) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId, userId });
  const variant = options.variant;
  const mode = options.mode ?? 'standard';
  const modeOptions = useMemo(
    () =>
      MODE_OPTIONS.map((rv) => ({
        id: rv.id,
        label: t(rv.nameKey),
        emoji: rv.emoji,
      })),
    [t],
  );
  const activeModeMeta =
    MODE_OPTIONS.find((rv) => rv.id === mode) ?? MODE_OPTIONS[0];
  return (
    <div className="flex flex-col gap-4">
      <LobbyOptionSection title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionSection>
      <LobbyOptionSection title={t('games.backgammon_v1.lobby.ruleVariant')}>
        <LobbyChipGroup
          options={modeOptions}
          value={mode}
          onChange={(v) => setOption({ mode: v })}
          disabled={!isHost}
          accentColor="#a855f7"
          testIdPrefix="backgammon-rule-variant"
        />
        <span className="text-[14px] opacity-60">
          {t(activeModeMeta.descriptionKey)}
        </span>
      </LobbyOptionSection>
    </div>
  );
}
