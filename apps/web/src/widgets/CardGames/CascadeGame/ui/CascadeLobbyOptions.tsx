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
  const modeItems = [
    {
      id: 'classic',
      label: t('games.create.cascadeModeClassic'),
      description: t('games.create.cascadeModeClassicHint'),
    },
    {
      id: 'pure',
      label: t('games.create.cascadeModePure'),
      description: t('games.create.cascadeModePureHint'),
    },
    {
      id: 'speed',
      label: t('games.create.cascadeModeSpeed'),
      description: t('games.create.cascadeModeSpeedHint'),
    },
  ];

  return (
    <LobbyOptionStack>
      <LobbyHostOnlyNote show={!isHost} />
      <LobbyOptionGroup title={t('games.create.cascadeMode')}>
        <LobbyChoice
          aria-label={t('games.create.cascadeMode')}
          items={modeItems}
          value={options.mode}
          disabled={!isHost}
          onChange={(v) => setOption({ mode: v })}
          testIdPrefix="cascade-mode"
        />
      </LobbyOptionGroup>
      <LobbyOptionGroup title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={options.variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionGroup>
      <LobbySubAdvanced
        testId="cascade-house-rules"
        title={t('games.lobby.advancedSettings')}
      >
        <LobbySwitchRow
          label={t('games.cascade_v1.lobby.stacking')}
          hint={t('games.cascade_v1.lobby.stackingAutoHint')}
          checked={options.stackingEnabled}
          onCheckedChange={() => {}}
          disabled
        />
        <LobbySwitchRow
          testId="cascade-last-card-call"
          label={t('games.cascade_v1.lobby.lastCardCall')}
          checked={options.lastCardCallEnabled}
          onCheckedChange={(val) => setOption({ lastCardCallEnabled: val })}
          disabled={!isHost}
        />
      </LobbySubAdvanced>
    </LobbyOptionStack>
  );
}
