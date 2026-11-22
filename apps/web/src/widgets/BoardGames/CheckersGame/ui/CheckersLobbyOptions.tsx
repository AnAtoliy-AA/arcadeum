'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  LobbyOptionSection,
  LobbyChipGroup,
} from '@/features/games/ui/LobbyOptions';
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
  const modeOptions = MODE_OPTIONS.map((rv) => ({
    id: rv.id,
    label: `${t(rv.nameKey)} (${rv.id === 'international' ? '10×10' : '8×8'})`,
    emoji:
      rv.id === 'american' ? '🇺🇸' : rv.id === 'international' ? '🌍' : '🇷🇺',
  }));

  const ruleConfig = MODE_CONFIGS[mode];

  return (
    <div className="flex flex-col items-stretch gap-4">
      <div
        data-testid="checkers-board-size-section"
        className="flex flex-col items-stretch gap-2 p-3.5 rounded-xl border border-[var(--glassBorder)] bg-[var(--surface)]/50"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📐</span>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--textPrimary)]">
            {t('games.checkers_v1.lobby.ruleVariant')}
          </span>
        </div>
        <LobbyChipGroup
          options={modeOptions}
          value={mode}
          onChange={(v) => setOption({ mode: v })}
          disabled={!isHost}
          accentColor="#2563eb"
          testIdPrefix="checkers-rule-variant"
        />
        <span className="text-xs text-[var(--textSecondary)] opacity-80">
          {t(MODE_OPTIONS.find((rv) => rv.id === mode)!.descriptionKey)}
        </span>
      </div>
      <LobbyOptionSection title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionSection>
      <LobbyOptionSection title={t('games.checkers_v1.lobby.rules')}>
        <div className="flex flex-col items-stretch gap-2">
          <label
            className={cx(
              'flex items-center gap-2',
              isHost
                ? 'cursor-pointer opacity-100'
                : 'cursor-not-allowed opacity-50',
            )}
          >
            <input
              type="checkbox"
              checked={options.forcedCaptures}
              disabled={!isHost}
              onChange={(e) => setOption({ forcedCaptures: e.target.checked })}
              className="h-4 w-4 accent-[#2563eb]"
            />
            <span className="text-[16px]">
              {t('games.checkers_v1.lobby.forcedCaptures')}
            </span>
          </label>
          <label
            className={cx(
              'flex items-center gap-2',
              isHost
                ? 'cursor-pointer opacity-100'
                : 'cursor-not-allowed opacity-50',
            )}
          >
            <input
              type="checkbox"
              checked={
                options.backwardCaptures || ruleConfig.backwardCapturesForMen
              }
              disabled={!isHost || ruleConfig.backwardCapturesForMen}
              onChange={(e) =>
                setOption({ backwardCaptures: e.target.checked })
              }
              className="h-4 w-4 accent-[#2563eb]"
            />
            <span className="text-[16px]">
              {t('games.checkers_v1.lobby.backwardCaptures')}
              {ruleConfig.backwardCapturesForMen
                ? ` (${t('games.checkers_v1.lobby.alwaysEnabled')})`
                : ''}
            </span>
          </label>
        </div>
      </LobbyOptionSection>
      <span className="text-[14px] opacity-[0.7]">
        {t('games.checkers_v1.rules.steps')}
      </span>
    </div>
  );
}
