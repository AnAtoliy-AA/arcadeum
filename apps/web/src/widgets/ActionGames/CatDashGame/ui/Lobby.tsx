'use client';

import { memo, useMemo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import {
  LobbyOptionSection,
  LobbyChipGroup,
} from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import type { GameRoomSummary } from '@/shared/types/games';
import { CAT_DASH_THEMES } from '../lib/constants';
import { CatDashRulesModal } from './RulesModal';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

interface CatDashLobbyProps {
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (opts?: { withBots?: boolean; botCount?: number }) => void;
  onLeaveRoom: () => void;
  onDeleteRoom: () => void;
  onKickPlayer: (userId: string) => void;
  onRefresh: () => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  showRulesOpen?: boolean;
  onShowRulesClose?: () => void;
}

const CAT_DASH_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #fff 0%, #c084fc 40%, #67e8f9 80%, #fff 100%)',
  buttonGradient: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
};

export const CatDashLobby = memo(function CatDashLobby({
  room,
  userId,
  isHost,
  startBusy,
  onStartGame,
  onLeaveRoom,
  onDeleteRoom,
  onKickPlayer,
  onRefresh,
  onReorderPlayers,
  showRulesOpen,
  onShowRulesClose,
}: CatDashLobbyProps) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId: room.id, userId });

  const options = useMemo(
    () =>
      (room.gameOptions ?? {}) as {
        theme?: string;
        trackType?: string;
        columns?: number;
        trackLength?: number;
      },
    [room.gameOptions],
  );

  const lobbyTheme = useMemo(
    () =>
      getLobbyTheme(
        CAT_DASH_THEMES,
        options.theme,
        CAT_DASH_LOBBY_THEME.fallbackLightGradient,
        CAT_DASH_LOBBY_THEME.buttonGradient,
      ),
    [options.theme],
  );

  const columnsVal = options.columns || 10;
  const trackLengthVal = options.trackLength || 60;

  const handleThemeChange = (themeId: string) => {
    if (!isHost) return;
    setOption({ theme: themeId });
  };

  const handleColumnsChange = (cols: string) => {
    if (!isHost) return;
    setOption({ columns: Number(cols) });
  };

  const handleTrackLengthChange = (len: string) => {
    if (!isHost) return;
    setOption({ trackLength: Number(len) });
  };

  const optionsSlot = (
    <div className="flex flex-col items-stretch gap-3 p-2">
      <LobbyOptionSection title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={options.theme ?? 'adventure'}
          onSelect={handleThemeChange}
          disabled={!isHost}
        />
      </LobbyOptionSection>

      <LobbyOptionSection title={t('games.cat_dash_v1.lobby.columns')}>
        <LobbyChipGroup
          options={[8, 10, 12].map((cols) => ({
            id: String(cols),
            label: `${cols} ${t('games.cat_dash_v1.lobby.columnsUnit')}`,
          }))}
          value={String(columnsVal)}
          onChange={handleColumnsChange}
          disabled={!isHost}
          accentColor="#7c3aed"
          testIdPrefix="catdash-columns"
        />
      </LobbyOptionSection>

      <LobbyOptionSection title={t('games.cat_dash_v1.lobby.trackLength')}>
        <LobbyChipGroup
          options={[40, 60, 80, 100].map((len) => ({
            id: String(len),
            label: `${len} ${t('games.cat_dash_v1.lobby.spacesUnit')}`,
          }))}
          value={String(trackLengthVal)}
          onChange={handleTrackLengthChange}
          disabled={!isHost}
          accentColor="#7c3aed"
          testIdPrefix="catdash-track"
        />
      </LobbyOptionSection>
    </div>
  );

  return (
    <>
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        gameName="Cat Dash"
        gameIcon="🐱"
        variantName={options.theme}
        minPlayers={2}
        maxPlayers={6}
        theme={lobbyTheme}
        enableBots
        showDifficulty={false}
        optionsSlot={optionsSlot}
        onStartGame={onStartGame}
        onLeaveRoom={onLeaveRoom}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onRefresh={onRefresh}
        onReorderPlayers={onReorderPlayers}
      />
      <CatDashRulesModal
        open={!!showRulesOpen}
        onClose={onShowRulesClose ?? (() => {})}
      />
    </>
  );
});
