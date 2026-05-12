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
import { SeaBattlePlayerState, CELL_STATE, type SeaBattleTeam } from '../types';
import { getPlayerColor } from '@/shared/lib/playerColors';

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
  teams?: SeaBattleTeam[];
  activeShooterId?: string;
}

interface PlayerRowProps {
  player: SeaBattlePlayerState;
  isMe: boolean;
  isActive: boolean;
  teamColor?: string;
  resolveDisplayName: (id: string, fb: string) => string;
  idlePlayers: string[];
  t: (key: TranslationKey) => string;
}

function PlayerRow({
  player,
  isMe,
  isActive,
  teamColor,
  resolveDisplayName,
  idlePlayers,
  t,
}: PlayerRowProps) {
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
      borderLeftWidth={teamColor ? 4 : 1}
      borderLeftColor={teamColor || undefined}
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
            {t('games.sea_battle_v1.table.players.alive' as TranslationKey)}
          </Badge>
        </XStack>
      )}
      <Text
        fontSize={19}
        fontWeight="600"
        style={{ color: teamColor ?? getPlayerColor(player.playerId) }}
      >
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
}

export function SeaBattleTable({
  players,
  currentUserId,
  currentTurnIndex,
  playerOrder,
  resolveDisplayName,
  teams,
  activeShooterId,
}: SeaBattleTableProps) {
  const { t } = useTranslation();
  const idlePlayers = useGameStore((s: GameState) => s.idlePlayers);
  const activePlayerId = activeShooterId ?? playerOrder[currentTurnIndex];
  const isMyTurn = activePlayerId === currentUserId;
  const activePlayer = players.find((p) => p.playerId === activePlayerId);
  const activeName = activePlayer
    ? resolveDisplayName(activePlayer.playerId, 'Player')
    : '...';

  const teamMode = !!teams && teams.length > 0;
  const playerById = new Map(players.map((p) => [p.playerId, p]));
  const activePlayerTeam = activePlayer
    ? teams?.find((tm) => tm.playerIds.includes(activePlayer.playerId))
    : undefined;
  const activePlayerColor = activePlayer
    ? (activePlayerTeam?.color ?? getPlayerColor(activePlayer.playerId))
    : undefined;

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
          <Text
            fontSize={17}
            fontWeight="800"
            style={activePlayerColor ? { color: activePlayerColor } : undefined}
          >
            {isMyTurn
              ? t(
                  'games.sea_battle_v1.table.players.yourTurnAttack' as TranslationKey,
                ).replace('🎯 ', '')
              : activeName}
          </Text>
        </YStack>
      </GlassCard>

      {teamMode ? (
        <YStack gap="$5" width="100%" alignItems="center">
          {teams!.map((team) => {
            const teamPlayers = team.playerIds
              .map((id) => playerById.get(id))
              .filter((p): p is SeaBattlePlayerState => !!p);
            if (teamPlayers.length === 0) return null;
            return (
              <YStack key={team.id} gap="$3" width="100%" alignItems="center">
                <XStack
                  alignItems="center"
                  gap="$2"
                  paddingHorizontal="$3"
                  paddingVertical="$1.5"
                  borderRadius={20}
                  backgroundColor="rgba(0,0,0,0.4)"
                  borderWidth={1}
                  borderLeftWidth={4}
                  borderLeftColor={team.color}
                  borderColor="rgba(255,255,255,0.1)"
                >
                  <YStack
                    width={10}
                    height={10}
                    borderRadius={100}
                    backgroundColor={team.color}
                  />
                  <Text fontSize={14} fontWeight="700" color="white">
                    {team.name}
                  </Text>
                </XStack>
                <SeaBattleGrids>
                  {teamPlayers.map((player) => (
                    <PlayerRow
                      key={player.playerId}
                      player={player}
                      isMe={player.playerId === currentUserId}
                      isActive={activePlayerId === player.playerId}
                      teamColor={team.color}
                      resolveDisplayName={resolveDisplayName}
                      idlePlayers={idlePlayers}
                      t={t}
                    />
                  ))}
                </SeaBattleGrids>
              </YStack>
            );
          })}
        </YStack>
      ) : (
        <SeaBattleGrids>
          {players.map((player) => (
            <PlayerRow
              key={player.playerId}
              player={player}
              isMe={player.playerId === currentUserId}
              isActive={activePlayerId === player.playerId}
              resolveDisplayName={resolveDisplayName}
              idlePlayers={idlePlayers}
              t={t}
            />
          ))}
        </SeaBattleGrids>
      )}
    </YStack>
  );
}
