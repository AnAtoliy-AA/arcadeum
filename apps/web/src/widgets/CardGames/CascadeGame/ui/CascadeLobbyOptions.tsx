'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  LobbyOptionSection,
  LobbyChipGroup,
  LobbyToggle,
} from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import {
  type CascadeMode,
  type CascadeOptions,
  type CascadeTheme,
} from '../types';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

export const CASCADE_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #f8fafc 0%, #c4b5fd 50%, #f8fafc 100%)',
  buttonGradient: 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)',
};

export function resolveCascadeLobbyOptions(
  raw: unknown,
  fallbackTheme: string,
): CascadeOptions {
  const r = (raw ?? {}) as Partial<{
    theme: string;
    variant: string;
    mode: string;
    stackingEnabled: boolean;
    lastCardCallEnabled: boolean;
  }>;
  const knownModes = ['classic', 'pure', 'speed'] as const;
  const mode: CascadeMode = knownModes.includes(r.mode as CascadeMode)
    ? (r.mode as CascadeMode)
    : 'classic';
  const theme = (r.theme ?? r.variant ?? fallbackTheme) as CascadeTheme;
  return {
    variant: theme,
    theme,
    mode,
    stackingEnabled: mode !== 'pure',
    lastCardCallEnabled:
      typeof r.lastCardCallEnabled === 'boolean' ? r.lastCardCallEnabled : true,
  };
}

export function CascadeLobbyOptionsPanel({
  options,
  roomId,
  userId,
  isHost,
}: {
  options: CascadeOptions;
  roomId: string;
  userId: string;
  isHost: boolean;
}) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId, userId });
  const modeOptions = [
    {
      id: 'classic',
      label: t('games.create.cascadeModeClassic') || 'Classic',
    },
    {
      id: 'pure',
      label: t('games.create.cascadeModePure') || 'Pure',
    },
    {
      id: 'speed',
      label: t('games.create.cascadeModeSpeed') || 'Speed',
    },
  ];

  const getModeHint = () => {
    switch (options.mode) {
      case 'pure':
        return (
          t('games.create.cascadeModePureHint') ||
          'No stacking: draw cards resolve immediately'
        );
      case 'speed':
        return (
          t('games.create.cascadeModeSpeedHint') ||
          'Stacking enabled with per-turn timer'
        );
      default:
        return (
          t('games.create.cascadeModeClassicHint') ||
          'Full ruleset with stacking'
        );
    }
  };

  return (
    <div className="flex flex-col items-stretch gap-4">
      <LobbyOptionSection title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={options.variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionSection>

      {isHost && (
        <LobbyOptionSection
          title={t('games.create.cascadeMode') || 'Game Mode'}
          hint={getModeHint()}
        >
          <LobbyChipGroup
            options={modeOptions}
            value={options.mode}
            onChange={(v) => setOption({ mode: v })}
            accentColor="#fbbf24"
            testIdPrefix="cascade-mode"
          />
        </LobbyOptionSection>
      )}

      <LobbyToggle
        label={t('games.cascade_v1.lobby.stacking')}
        checked={options.stackingEnabled}
        onCheckedChange={() => {}}
        disabled
      />

      <LobbyToggle
        label={t('games.cascade_v1.lobby.lastCardCall')}
        checked={options.lastCardCallEnabled}
        onCheckedChange={(val) => setOption({ lastCardCallEnabled: val })}
        disabled={!isHost}
      />
    </div>
  );
}
