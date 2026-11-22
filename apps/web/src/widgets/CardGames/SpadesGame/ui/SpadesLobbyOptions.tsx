'use client';

import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  LobbyOptionSection,
  LobbyChipGroup,
  LobbyToggle,
} from '@/features/games/ui/LobbyOptions';
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
    <div className="flex flex-col items-stretch gap-4">
      <LobbyOptionSection title={t('games.spades_v1.lobby.variant')}>
        <GameThemePicker
          selectedTheme={options.variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionSection>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LobbyOptionSection title={t('games.spades_v1.lobby.targetScore')}>
          <LobbyChipGroup
            options={[
              { id: '300', label: '300' },
              { id: '500', label: '500' },
            ]}
            value={String(options.targetScore)}
            onChange={(v) =>
              setOption({ targetScore: v === '300' ? 300 : 500 })
            }
            accentColor="#1d4ed8"
            testIdPrefix="spades-target-score"
          />
        </LobbyOptionSection>

        <div className="flex items-center">
          <LobbyToggle
            label={t('games.spades_v1.lobby.nilEnabled')}
            checked={options.nilEnabled}
            onCheckedChange={(val) => setOption({ nilEnabled: val })}
            disabled={!isHost}
          />
        </div>
      </div>
    </div>
  );
}
