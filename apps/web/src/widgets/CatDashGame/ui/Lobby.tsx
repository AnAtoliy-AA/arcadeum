'use client';

import { memo, useMemo } from 'react';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
} from '@/features/games/ui/ReusableGameLobby';
import type { GameRoomSummary } from '@/shared/types/games';
import { CAT_DASH_VARIANTS } from '../lib/constants';
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

const getCatDashTheme = (variantId?: string): GameLobbyTheme => {
  const variant = CAT_DASH_VARIANTS.find((v) => v.id === variantId);
  const lightGradient =
    variant?.lightGradient ??
    'linear-gradient(90deg, #fff 0%, #c084fc 40%, #67e8f9 80%, #fff 100%)';
  return {
    titleGradient: lightGradient,
    variantGradient: lightGradient,
    buttonGradient: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
  };
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
    () => getCatDashTheme(options.theme),
    [options.theme],
  );

  const columnsVal = options.columns || 10;
  const trackLengthVal = options.trackLength || 60;

  const handleThemeChange = (themeId: string) => {
    if (!isHost) return;
    setOption({ theme: themeId });
  };

  const handleColumnsChange = (cols: number) => {
    if (!isHost) return;
    setOption({ columns: cols });
  };

  const handleTrackLengthChange = (len: number) => {
    if (!isHost) return;
    setOption({ trackLength: len });
  };

  const optionsSlot = (
    <div className="box-border flex flex-col items-stretch gap-3 p-2">
      <div className="box-border flex flex-col items-stretch gap-2">
        <span className="box-border font-bold text-[13px] text-[#94a3b8]">
          Theme
        </span>
        <div className="box-border flex flex-row items-stretch gap-2 flex-wrap">
          {CAT_DASH_VARIANTS.map((v) => (
            <div
              className={
                '"box-border flex flex-col items-stretch p-2 px-3 rounded-xl border-[2px]"'
              }
              style={{
                borderColor: options.theme === v.id ? '#7c3aed' : 'transparent',
                backgroundColor:
                  options.theme === v.id
                    ? 'rgba(124, 58, 237, 0.15)'
                    : 'rgba(255,255,255,0.05)',
                cursor: isHost ? 'pointer' : 'default',
              }}
              onClick={() => handleThemeChange(v.id)}
              key={v.id}
            >
              <div className="box-border flex flex-row gap-1 items-center">
                <span className="box-border text-[16px]">{v.emoji}</span>
                <span className="box-border text-[12px] text-[#e2e8f0]">
                  {v.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="box-border flex flex-col items-stretch gap-2">
        <span className="box-border font-bold text-[13px] text-[#94a3b8]">
          Board Width (Columns)
        </span>
        <div className="box-border flex flex-row items-stretch gap-2 flex-wrap">
          {[8, 10, 12].map((cols) => (
            <div
              className={
                '"box-border flex flex-col items-stretch p-2 px-3 rounded-xl border-[2px]"'
              }
              style={{
                borderColor: columnsVal === cols ? '#7c3aed' : 'transparent',
                backgroundColor:
                  columnsVal === cols
                    ? 'rgba(124, 58, 237, 0.15)'
                    : 'rgba(255,255,255,0.05)',
                cursor: isHost ? 'pointer' : 'default',
              }}
              onClick={() => handleColumnsChange(cols)}
              key={cols}
            >
              <span className="box-border text-[12px] text-[#e2e8f0] font-bold">
                {cols} Columns
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="box-border flex flex-col items-stretch gap-2">
        <span className="box-border font-bold text-[13px] text-[#94a3b8]">
          Track Length (Spaces)
        </span>
        <div className="box-border flex flex-row items-stretch gap-2 flex-wrap">
          {[40, 60, 80, 100].map((len) => (
            <div
              className={
                '"box-border flex flex-col items-stretch p-2 px-3 rounded-xl border-[2px]"'
              }
              style={{
                borderColor: trackLengthVal === len ? '#7c3aed' : 'transparent',
                backgroundColor:
                  trackLengthVal === len
                    ? 'rgba(124, 58, 237, 0.15)'
                    : 'rgba(255,255,255,0.05)',
                cursor: isHost ? 'pointer' : 'default',
              }}
              onClick={() => handleTrackLengthChange(len)}
              key={len}
            >
              <span className="box-border text-[12px] text-[#e2e8f0] font-bold">
                {len} Spaces
              </span>
            </div>
          ))}
        </div>
      </div>
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
