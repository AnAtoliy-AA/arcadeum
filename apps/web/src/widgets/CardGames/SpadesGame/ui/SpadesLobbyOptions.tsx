'use client';

import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  LobbyChoice,
  LobbyHostOnlyNote,
  LobbyOptionGroup,
  LobbyOptionStack,
  LobbySwitchRow,
} from '@/features/games/ui/LobbyOptionKit';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { resolveSpadesTheme } from '../lib/theme';

export const SPADES_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #eef2ff 0%, #818cf8 50%, #eef2ff 100%)',
  buttonGradient: 'linear-gradient(135deg, #1d4ed8 0%, #312e81 100%)',
};

export function resolveSpadesLobbyOptions(raw: unknown): {
  variant: ReturnType<typeof resolveSpadesTheme>;
  nilEnabled: boolean;
  targetScore: number;
} {
  const r = (raw ?? {}) as Partial<{
    nilEnabled: boolean;
    targetScore: number;
  }>;
  return {
    variant: resolveSpadesTheme(raw),
    nilEnabled: typeof r.nilEnabled === 'boolean' ? r.nilEnabled : true,
    targetScore: r.targetScore === 300 ? 300 : 500,
  };
}

export type SpadesLobbyOptions = ReturnType<typeof resolveSpadesLobbyOptions>;

export function SpadesLobbyOptionsPanel({
  options,
  roomId,
  userId,
  isHost,
}: {
  options: SpadesLobbyOptions;
  roomId: string;
  userId: string;
  isHost: boolean;
}) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId, userId });
  return (
    <LobbyOptionStack>
      <LobbyHostOnlyNote show={!isHost} />
      <LobbyOptionGroup
        title={t('games.spades_v1.lobby.targetScore')}
        hint={t('games.spades_v1.lobby.targetScoreHint')}
      >
        <LobbyChoice
          aria-label={t('games.spades_v1.lobby.targetScore')}
          items={[
            { id: '300', label: '300' },
            { id: '500', label: '500' },
          ]}
          value={String(options.targetScore)}
          disabled={!isHost}
          onChange={(v) => setOption({ targetScore: v === '300' ? 300 : 500 })}
          testIdPrefix="spades-target-score"
        />
      </LobbyOptionGroup>
      <LobbySwitchRow
        testId="spades-nil-switch"
        label={t('games.spades_v1.lobby.nilEnabled')}
        hint={t('games.spades_v1.lobby.nilEnabledHint')}
        checked={options.nilEnabled}
        disabled={!isHost}
        onCheckedChange={(val) => setOption({ nilEnabled: val })}
      />
      <LobbyOptionGroup title={t('games.spades_v1.lobby.variant')}>
        <GameThemePicker
          selectedTheme={options.variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionGroup>
    </LobbyOptionStack>
  );
}
