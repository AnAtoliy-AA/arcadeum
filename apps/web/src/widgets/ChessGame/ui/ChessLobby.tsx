'use client';

import { useMemo } from 'react';
import { YStack, Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
} from '@/features/games/ui/ReusableGameLobby';
import type { GameRoomSummary } from '@/shared/types/games';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import type { ChessVariant, TimeControl } from '../types';
import { TIME_CONTROLS } from '../types';
import { RulesModal } from './RulesModal';

const LOBBY_THEME: GameLobbyTheme = {
  titleGradient:
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  variantGradient:
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  buttonGradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
};

function formatTimeControl(tc: TimeControl | null): string {
  if (!tc) return 'No clock';
  const mins = Math.floor(tc.initialSeconds / 60);
  return tc.incrementSeconds > 0
    ? `${mins}+${tc.incrementSeconds}`
    : `${mins}|0`;
}

interface ChessLobbyProps {
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (options?: { withBots?: boolean; botCount?: number }) => void;
  onLeaveRoom?: () => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onRefresh?: () => void;
  showRulesOpen: boolean;
  onShowRulesClose: () => void;
}

export function ChessLobby({
  room,
  userId,
  isHost,
  startBusy,
  onStartGame,
  onLeaveRoom,
  onDeleteRoom,
  onKickPlayer,
  onRefresh,
  showRulesOpen,
  onShowRulesClose,
}: ChessLobbyProps) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId: room.id, userId });

  const options = useMemo(() => {
    const raw = (room.gameOptions ?? {}) as Partial<{
      variant: string;
      timeControl: TimeControl | null;
    }>;
    return {
      variant: (raw.variant ?? 'standard') as ChessVariant,
      timeControl: (raw.timeControl ?? null) as TimeControl | null,
    };
  }, [room.gameOptions]);

  const variantLabel = options.variant === 'chess960' ? 'Chess960' : 'Standard';

  const optionsSlot = (
    <YStack gap="$4">
      <YStack gap="$2">
        <Text fontWeight="600">{t('games.chess_v1.lobby.variant')}</Text>
        <YStack gap="$2">
          {(['standard', 'chess960'] as const).map((v) => (
            <button
              key={v}
              type="button"
              disabled={!isHost}
              onClick={() => setOption({ variant: v })}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border:
                  options.variant === v
                    ? '2px solid #2563eb'
                    : '1px solid rgba(255,255,255,0.15)',
                backgroundColor:
                  options.variant === v
                    ? 'rgba(37,99,235,0.15)'
                    : 'rgba(255,255,255,0.03)',
                color: 'inherit',
                cursor: isHost ? 'pointer' : 'default',
                textAlign: 'left' as const,
                width: '100%',
              }}
            >
              <Text fontWeight="600" fontSize="$3">
                {v === 'standard' ? 'Standard' : 'Chess960'}
              </Text>
              <Text fontSize="$2" opacity={0.7}>
                {v === 'standard'
                  ? 'Classic starting position'
                  : 'Randomized starting position'}
              </Text>
            </button>
          ))}
        </YStack>
      </YStack>

      <YStack gap="$2">
        <Text fontWeight="600">{t('games.chess_v1.lobby.timeControl')}</Text>
        <YStack gap="$2">
          {TIME_CONTROLS.map((tc, idx) => (
            <button
              key={idx}
              type="button"
              disabled={!isHost}
              onClick={() => setOption({ timeControl: tc })}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border:
                  options.timeControl?.initialSeconds === tc.initialSeconds &&
                  options.timeControl?.incrementSeconds === tc.incrementSeconds
                    ? '2px solid #2563eb'
                    : '1px solid rgba(255,255,255,0.15)',
                backgroundColor:
                  options.timeControl?.initialSeconds === tc.initialSeconds &&
                  options.timeControl?.incrementSeconds === tc.incrementSeconds
                    ? 'rgba(37,99,235,0.15)'
                    : 'rgba(255,255,255,0.03)',
                color: 'inherit',
                cursor: isHost ? 'pointer' : 'default',
                textAlign: 'left' as const,
                width: '100%',
              }}
            >
              <Text fontWeight="600" fontSize="$3">
                {formatTimeControl(tc)}
              </Text>
              <Text fontSize="$2" opacity={0.7}>
                {tc.type}
              </Text>
            </button>
          ))}
          <button
            type="button"
            disabled={!isHost}
            onClick={() => setOption({ timeControl: null })}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border:
                options.timeControl === null
                  ? '2px solid #2563eb'
                  : '1px solid rgba(255,255,255,0.15)',
              backgroundColor:
                options.timeControl === null
                  ? 'rgba(37,99,235,0.15)'
                  : 'rgba(255,255,255,0.03)',
              color: 'inherit',
              cursor: isHost ? 'pointer' : 'default',
              textAlign: 'left' as const,
              width: '100%',
            }}
          >
            <Text fontWeight="600" fontSize="$3">
              No clock
            </Text>
            <Text fontSize="$2" opacity={0.7}>
              Unlimited time
            </Text>
          </button>
        </YStack>
      </YStack>
    </YStack>
  );

  return (
    <>
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        onStartGame={onStartGame}
        onLeaveRoom={onLeaveRoom}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onRefresh={onRefresh}
        gameName={t('games.chess_v1.name')}
        gameIcon="♟"
        variantName={variantLabel}
        minPlayers={2}
        theme={LOBBY_THEME}
        enableBots
        labels={{
          startWithBotsLabel: t('games.chess_v1.lobby.startWithBots'),
        }}
        optionsSlot={optionsSlot}
        showInvitedPlayers
        showReorderControls={false}
      />
      <RulesModal open={showRulesOpen} onClose={onShowRulesClose} />
    </>
  );
}
