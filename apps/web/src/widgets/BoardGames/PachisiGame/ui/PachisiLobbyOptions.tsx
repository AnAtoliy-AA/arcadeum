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
import type { PachisiOptions, PachisiMode, PachisiTheme } from '../types';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

export const PACHISI_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  buttonGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
};

export const MODE_OPTIONS: Array<{
  id: PachisiMode;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  emoji: string;
}> = [
  {
    id: 'standard',
    nameKey:
      'games.pachisi_v1.lobby.ruleVariants.standard.name' as TranslationKey,
    descriptionKey:
      'games.pachisi_v1.lobby.ruleVariants.standard.description' as TranslationKey,
    emoji: '🎲',
  },
  {
    id: 'quick',
    nameKey: 'games.pachisi_v1.lobby.ruleVariants.quick.name' as TranslationKey,
    descriptionKey:
      'games.pachisi_v1.lobby.ruleVariants.quick.description' as TranslationKey,
    emoji: '⚡',
  },
];

export function resolvePachisiLobbyOptions(
  raw: unknown,
  fallbackTheme: string,
): PachisiOptions {
  const r = (raw ?? {}) as Partial<{
    theme: string;
    variant: string;
    mode: string;
    aiDifficulty: string;
  }>;
  return {
    theme: (r.theme ?? r.variant ?? fallbackTheme) as PachisiTheme,
    variant: (r.theme ?? r.variant ?? fallbackTheme) as PachisiTheme,
    mode: (r.mode ?? 'standard') as PachisiMode,
    aiDifficulty: (r.aiDifficulty ?? 'medium') as
      'easy' | 'medium' | 'hard' | 'expert',
  };
}

export function PachisiLobbyOptionsPanel({
  options,
  roomId,
  userId,
  isHost,
}: {
  options: PachisiOptions;
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
      <LobbyOptionSection title={t('games.pachisi_v1.lobby.ruleVariant')}>
        <LobbyChipGroup
          options={modeOptions}
          value={mode}
          onChange={(v) => setOption({ mode: v })}
          disabled={!isHost}
          accentColor="#f59e0b"
          testIdPrefix="pachisi-rule-variant"
        />
        <span className="text-[14px] opacity-60">
          {t(activeModeMeta.descriptionKey)}
        </span>
      </LobbyOptionSection>
    </div>
  );
}
