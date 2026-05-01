'use client';
import { YStack, XStack, Text } from 'tamagui';
import { GlassCard, Badge, IdleBadge } from '@/shared/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { SeaBattleGrids } from './SeaBattleGrids';
import { ShipsLeft } from './ShipsLeft';
import { SeaBattlePlayerState, CELL_STATE } from '../types';

const CELL_COLORS: Record<number, string> = {
  [CELL_STATE.EMPTY]: 'rgba(255, 255, 255, 0.05)',
  [CELL_STATE.SHIP]: '#666',
  [CELL_STATE.HIT]: '#ff4444',
  [CELL_STATE.MISS]: '#ffffff',
};

interface SeaBattleTableProps {
  players: SeaBattlePlayerState[];
  currentUserId: string | null;
  currentTurnIndex: number;
  playerOrder: string[];
  resolveDisplayName: (id: string, fb: string) => string;
}

export function SeaBattleTable({
  players,
  currentUserId,
  currentTurnIndex,
  playerOrder,
  resolveDisplayName,
}: SeaBattleTableProps) {
  const { t } = useTranslation();
  const idlePlayers = useGameStore((s: GameState) => s.idlePlayers);
  const activePlayerId = playerOrder[currentTurnIndex];
  const isMyTurn = activePlayerId === currentUserId;
  const activePlayer = players.find((p) => p.playerId === activePlayerId);
  const activeName = activePlayer
    ? resolveDisplayName(activePlayer.playerId, 'Player')
    : '...';

  return (
    <YStack
      alignItems="center"
      justifyContent="center"
      width="100%"
      minHeight="100%"
      gap="$5"
      padding="$5"
    >
      <GlassCard
        flexDirection="row"
        padding="$4"
        paddingHorizontal="$6"
        alignItems="center"
        gap="$4"
        borderRadius={100}
      >
        <Badge
          variant={isMyTurn ? 'success' : 'info'}
          size="md"
          pulse={isMyTurn}
        >
          {isMyTurn ? '🎯' : '⏳'}
        </Badge>
        <YStack>
          <Text fontSize={13} opacity={0.7} fontWeight="700">
            {isMyTurn
              ? t(
                  'games.sea_battle_v1.table.players.yourTurn' as TranslationKey,
                )
              : t(
                  'games.sea_battle_v1.table.players.waitingFor' as TranslationKey,
                  { player: activeName },
                )}
          </Text>
          <Text fontSize={17} fontWeight="800">
            {isMyTurn
              ? t(
                  'games.sea_battle_v1.table.players.yourTurnAttack' as TranslationKey,
                ).replace('🎯 ', '')
              : activeName}
          </Text>
        </YStack>
      </GlassCard>

      <SeaBattleGrids>
        {players.map((player) => {
          const isMe = player.playerId === currentUserId;
          const isActive = playerOrder[currentTurnIndex] === player.playerId;

          return (
            <YStack
              key={player.playerId}
              alignItems="center"
              gap="$2"
              padding="$4"
              backgroundColor={
                isActive ? 'rgba(87, 195, 255, 0.05)' : 'rgba(0, 0, 0, 0.2)'
              }
              borderWidth={1}
              borderColor={
                isMe
                  ? 'var(--primary-color)'
                  : isActive
                    ? '#57c3ff'
                    : 'rgba(255,255,255,0.1)'
              }
              borderRadius={12}
              position="relative"
            >
              {isActive && (
                <XStack
                  position="absolute"
                  top={-10}
                  left="50%"
                  zIndex={10}
                  style={{ transform: 'translateX(-50%)' }}
                >
                  <Badge variant="success" size="sm" pulse>
                    {t(
                      'games.sea_battle_v1.table.players.alive' as TranslationKey,
                    )}
                  </Badge>
                </XStack>
              )}
              <Text fontSize={19} fontWeight="600" color="white">
                {resolveDisplayName(player.playerId, 'Player')}{' '}
                {isMe
                  ? `(${t('games.sea_battle_v1.table.players.you' as TranslationKey)})`
                  : ''}
                {idlePlayers.includes(player.playerId) && <IdleBadge />}
              </Text>
              <YStack
                flexDirection="row"
                flexWrap="wrap"
                backgroundColor="rgba(0,0,0,0.5)"
                padding={4}
                borderRadius={4}
                width="100%"
                maxWidth={320}
                aspectRatio={1}
              >
                {player.board.map((row, rIndex) =>
                  row.map((cellState, cIndex) => (
                    <YStack
                      key={`${rIndex}-${cIndex}`}
                      width="10%"
                      height="10%"
                      backgroundColor={
                        CELL_COLORS[isMe || cellState > 1 ? cellState : 0] ??
                        'transparent'
                      }
                      borderWidth={1}
                      borderColor="rgba(255,255,255,0.1)"
                      cursor="pointer"
                    />
                  )),
                )}
              </YStack>
              <ShipsLeft ships={player.ships} isMe={isMe} />
            </YStack>
          );
        })}
      </SeaBattleGrids>
    </YStack>
  );
}
