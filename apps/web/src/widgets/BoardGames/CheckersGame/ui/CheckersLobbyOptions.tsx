'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  LobbyChoice,
  LobbyHostOnlyNote,
  LobbyOptionGroup,
  LobbyOptionStack,
  LobbySubAdvanced,
  LobbySwitchRow,
} from '@/features/games/ui/LobbyOptionKit';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import type { CheckersOptions, CheckersTheme, Mode } from '../types';
import { MODE_CONFIGS } from '../types';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import type { TranslationKey } from '@/shared/i18n/useTranslation';

export const CHECKERS_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  buttonGradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
};

export function resolveCheckersLobbyOptions(
  raw: unknown,
  fallbackTheme: string,
): CheckersOptions {
  const r = (raw ?? {}) as Partial<{
    theme: string;
    variant: string;
    mode: string;
    forcedCaptures: boolean;
    backwardCaptures: boolean;
  }>;
  return {
    theme: (r.theme ?? r.variant ?? fallbackTheme) as CheckersTheme,
    variant: (r.theme ?? r.variant ?? fallbackTheme) as CheckersTheme,
    mode: (r.mode ?? 'american') as Mode,
    forcedCaptures: r.forcedCaptures !== false,
    backwardCaptures: r.backwardCaptures === true,
  };
}

const MODE_OPTIONS: Array<{
  id: Mode;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
}> = [
  {
    id: 'american',
    nameKey:
      'games.checkers_v1.lobby.ruleVariants.american.name' as TranslationKey,
    descriptionKey:
      'games.checkers_v1.lobby.ruleVariants.american.description' as TranslationKey,
  },
  {
    id: 'international',
    nameKey:
      'games.checkers_v1.lobby.ruleVariants.international.name' as TranslationKey,
    descriptionKey:
      'games.checkers_v1.lobby.ruleVariants.international.description' as TranslationKey,
  },
  {
    id: 'russian',
    nameKey:
      'games.checkers_v1.lobby.ruleVariants.russian.name' as TranslationKey,
    descriptionKey:
      'games.checkers_v1.lobby.ruleVariants.russian.description' as TranslationKey,
  },
];

export function CheckersLobbyOptionsPanel({
  options,
  roomId,
  userId,
  isHost,
}: {
  options: CheckersOptions;
  roomId: string;
  userId: string;
  isHost: boolean;
}) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId, userId });
  const variant = options.variant;
  const mode = options.mode;
  const ruleConfig = MODE_CONFIGS[mode];
  const modeItems = MODE_OPTIONS.map((rv) => ({
    id: rv.id,
    label: `${t(rv.nameKey)} (${rv.id === 'international' ? '10×10' : '8×8'})`,
    emoji:
      rv.id === 'american' ? '🇺🇸' : rv.id === 'international' ? '🌍' : '🇷🇺',
    description: t(rv.descriptionKey),
  }));

  return (
    <LobbyOptionStack>
      <LobbyHostOnlyNote show={!isHost} />
      <LobbyOptionGroup
        data-testid="checkers-board-size-section"
        title={t('games.checkers_v1.lobby.ruleVariant')}
      >
        <LobbyChoice
          aria-label={t('games.checkers_v1.lobby.ruleVariant')}
          items={modeItems}
          value={mode}
          disabled={!isHost}
          onChange={(v) => setOption({ mode: v })}
          testIdPrefix="checkers-rule-variant"
        />
      </LobbyOptionGroup>
      <LobbyOptionGroup title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionGroup>
      <LobbySubAdvanced
        testId="checkers-capture-rules"
        title={t('games.checkers_v1.lobby.rules')}
      >
        <LobbySwitchRow
          testId="checkers-forced-captures"
          label={t('games.checkers_v1.lobby.forcedCaptures')}
          hint={t('games.checkers_v1.lobby.forcedCapturesHint')}
          checked={options.forcedCaptures}
          disabled={!isHost}
          onCheckedChange={(v) => setOption({ forcedCaptures: v })}
        />
        <LobbySwitchRow
          testId="checkers-backward-captures"
          label={t('games.checkers_v1.lobby.backwardCaptures')}
          hint={t('games.checkers_v1.lobby.backwardCapturesHint')}
          badge={
            ruleConfig.backwardCapturesForMen
              ? t('games.checkers_v1.lobby.alwaysEnabled')
              : undefined
          }
          checked={
            options.backwardCaptures || ruleConfig.backwardCapturesForMen
          }
          disabled={!isHost || ruleConfig.backwardCapturesForMen}
          onCheckedChange={(v) => setOption({ backwardCaptures: v })}
        />
      </LobbySubAdvanced>
      <p className="text-xs text-[var(--textMuted)]">
        {t('games.checkers_v1.rules.steps')}
      </p>
    </LobbyOptionStack>
  );
}
