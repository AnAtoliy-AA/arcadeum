'use client';

import { useMemo, useState } from 'react';
import { YStack, Text } from 'tamagui';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
} from '@/features/games/ui/ReusableGameLobby';
import type { GameRoomSummary } from '@/shared/types/games';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import {
  DifficultySelector,
  type BotDifficulty,
} from '@/features/games/ui/DifficultySelector';
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
  onStartGame: (options?: {
    withBots?: boolean;
    botCount?: number;
    botDifficulty?: BotDifficulty;
  }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
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
  onReorderPlayers,
  onLeaveRoom,
  onDeleteRoom,
  onKickPlayer,
  onRefresh,
  showRulesOpen,
  onShowRulesClose,
}: ChessLobbyProps) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId: room.id, userId });
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');

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
          {(['standard', 'chess960'] as const).map((v) => {
            const isActive = options.variant === v;
            return (
              <Button
                key={v}
                variant="chip"
                size="md"
                flex={1}
                data-active={isActive}
                backgroundColor={
                  isActive
                    ? 'rgba(99, 102, 241, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)'
                }
                borderColor={
                  isActive
                    ? 'rgba(99, 102, 241, 0.5)'
                    : 'rgba(255, 255, 255, 0.1)'
                }
                color={isActive ? '#6366f1' : '$color'}
                hoverStyle={{
                  backgroundColor: isActive
                    ? 'rgba(99, 102, 241, 0.25)'
                    : 'rgba(255, 255, 255, 0.1)',
                }}
                borderRadius={10}
                fontWeight="600"
                disabled={!isHost}
                justifyContent="flex-start"
                
                onClick={() => setOption({ variant: v })}
              >
                <YStack>
                  <Text fontWeight="600" fontSize="$3">
                    {v === 'standard'
                      ? t('games.chess_v1.lobby.standard')
                      : t('games.chess_v1.lobby.chess960')}
                  </Text>
                  <Text fontSize="$2" opacity={0.7}>
                    {v === 'standard'
                      ? t('games.chess_v1.lobby.standardDesc')
                      : t('games.chess_v1.lobby.chess960Desc')}
                  </Text>
                </YStack>
              </Button>
            );
          })}
        </YStack>
      </YStack>

      <YStack gap="$2">
        <Text fontWeight="600">{t('games.chess_v1.lobby.timeControl')}</Text>
        <YStack gap="$2">
          {TIME_CONTROLS.map((tc, idx) => {
            const isActive =
              options.timeControl?.initialSeconds === tc.initialSeconds &&
              options.timeControl?.incrementSeconds === tc.incrementSeconds;
            return (
              <Button
                key={idx}
                variant="chip"
                size="md"
                flex={1}
                data-active={isActive}
                backgroundColor={
                  isActive
                    ? 'rgba(99, 102, 241, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)'
                }
                borderColor={
                  isActive
                    ? 'rgba(99, 102, 241, 0.5)'
                    : 'rgba(255, 255, 255, 0.1)'
                }
                color={isActive ? '#6366f1' : '$color'}
                hoverStyle={{
                  backgroundColor: isActive
                    ? 'rgba(99, 102, 241, 0.25)'
                    : 'rgba(255, 255, 255, 0.1)',
                }}
                borderRadius={10}
                fontWeight="600"
                disabled={!isHost}
                justifyContent="flex-start"
                
                onClick={() => setOption({ timeControl: tc })}
              >
                <YStack>
                  <Text fontWeight="600" fontSize="$3">
                    {formatTimeControl(tc)}
                  </Text>
                  <Text fontSize="$2" opacity={0.7}>
                    {tc.type === 'blitz'
                      ? t('games.chess_v1.lobby.blitz')
                      : tc.type === 'rapid'
                        ? t('games.chess_v1.lobby.rapid')
                        : t('games.chess_v1.lobby.classical')}
                  </Text>
                </YStack>
              </Button>
            );
          })}
          <Button
            variant="chip"
            size="md"
            flex={1}
            data-active={options.timeControl === null}
            backgroundColor={
              options.timeControl === null
                ? 'rgba(99, 102, 241, 0.2)'
                : 'rgba(255, 255, 255, 0.05)'
            }
            borderColor={
              options.timeControl === null
                ? 'rgba(99, 102, 241, 0.5)'
                : 'rgba(255, 255, 255, 0.1)'
            }
            color={options.timeControl === null ? '#6366f1' : '$color'}
            hoverStyle={{
              backgroundColor:
                options.timeControl === null
                  ? 'rgba(99, 102, 241, 0.25)'
                  : 'rgba(255, 255, 255, 0.1)',
            }}
            borderRadius={10}
            fontWeight="600"
            disabled={!isHost}
            justifyContent="flex-start"
            
            onClick={() => setOption({ timeControl: null })}
          >
            <YStack>
              <Text fontWeight="600" fontSize="$3">
                {t('games.chess_v1.lobby.noClock')}
              </Text>
              <Text fontSize="$2" opacity={0.7}>
                {t('games.chess_v1.lobby.unlimitedTime')}
              </Text>
            </YStack>
          </Button>
        </YStack>
      </YStack>

      <DifficultySelector
        value={botDifficulty}
        onChange={setBotDifficulty}
      />
    </YStack>
  );

  return (
    <>
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        onStartGame={(opts) => onStartGame({ ...opts, botDifficulty })}
        onLeaveRoom={onLeaveRoom}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onRefresh={onRefresh}
        gameName={t('games.chess_v1.name')}
        gameIcon="♟"
        variantName={variantLabel}
        minPlayers={2}
        maxPlayers={2}
        theme={LOBBY_THEME}
        enableBots
        labels={{
          startWithBotsLabel: t('games.chess_v1.lobby.startWithBots'),
        }}
        optionsSlot={optionsSlot}
        showInvitedPlayers
        showReorderControls
        onReorderPlayers={onReorderPlayers}
      />
      <RulesModal open={showRulesOpen} onClose={onShowRulesClose} />
    </>
  );
}
