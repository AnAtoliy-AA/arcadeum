'use client';
import { GlassCard, Badge, IdleBadge } from '@arcadeum/ui';
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
  shipCount?: number;
}

interface PlayerRowProps {
  player: SeaBattlePlayerState;
  isMe: boolean;
  isActive: boolean;
  teamColor?: string;
  resolveDisplayName: (id: string, fb: string) => string;
  idlePlayers: string[];
  shipCount?: number;
  t: (key: TranslationKey) => string;
}

function PlayerRow({
  player,
  isMe,
  isActive,
  teamColor,
  resolveDisplayName,
  idlePlayers,
  shipCount,
  t,
}: PlayerRowProps) {
  return (
    <div
      className="box-border flex flex-col items-center gap-2 p-4 border rounded-[12px] relative"
      style={{
        backgroundColor: isActive
          ? 'rgba(87, 195, 255, 0.05)'
          : 'rgba(0, 0, 0, 0.2)',
        borderColor: isMe
          ? 'var(--primary-color)'
          : isActive
            ? '#57c3ff'
            : 'rgba(255,255,255,0.1)',
        borderLeftWidth: teamColor ? 4 : 1,
        borderLeftColor: teamColor || undefined,
      }}
      key={player.playerId}
    >
      {isActive && (
        <div
          className="box-border flex flex-row items-stretch absolute top-[-10px] left-[50%] z-[10]"
          style={{ transform: 'translateX(-50%)' }}
        >
          <Badge variant="success" size="sm">
            {t('games.sea_battle_v1.table.players.alive' as TranslationKey)}
          </Badge>
        </div>
      )}
      <span
        className="box-border text-[19px] font-semibold"
        style={{ color: teamColor ?? getPlayerColor(player.playerId) }}
      >
        {resolveDisplayName(player.playerId, 'Player')}{' '}
        {isMe
          ? `(${t('games.sea_battle_v1.table.players.you' as TranslationKey)})`
          : ''}
        {idlePlayers.includes(player.playerId) && <IdleBadge />}
      </span>
      <div className="box-border flex items-stretch flex-row flex-wrap bg-[rgba(0,0,0,0.5)] p-4 rounded-2xl w-full max-w-[320px] aspect-[1]">
        {player.board.map((row, rIndex) =>
          row.map((cellState, cIndex) => (
            <div
              className="box-border flex flex-col items-stretch w-[10%] h-[10%] border border-[rgba(255,255,255,0.1)] cursor-pointer"
              style={{
                backgroundColor:
                  CELL_COLORS[isMe || cellState > 1 ? cellState : 0] ??
                  'transparent',
              }}
              key={`${rIndex}-${cIndex}`}
            />
          )),
        )}
      </div>
      <ShipsLeft ships={player.ships} isMe={isMe} shipCount={shipCount} />
    </div>
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
  shipCount,
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
    <div className="box-border flex flex-col items-center justify-center w-full min-h-full gap-5 p-5">
      <GlassCard
        className={'flex-row p-4 px-6 items-center gap-4 rounded-[100px]'}
      >
        <Badge variant={isMyTurn ? 'success' : 'info'} size="md">
          {isMyTurn ? '🎯' : '⏳'}
        </Badge>
        <div className="box-border flex flex-col items-stretch">
          <span className="box-border text-[13px] opacity-[0.7] font-bold">
            {isMyTurn
              ? t(
                  'games.sea_battle_v1.table.players.yourTurn' as TranslationKey,
                )
              : t(
                  'games.sea_battle_v1.table.players.waitingFor' as TranslationKey,
                  { player: activeName },
                )}
          </span>
          <span
            className="box-border text-[17px] font-extrabold"
            style={activePlayerColor ? { color: activePlayerColor } : undefined}
          >
            {isMyTurn
              ? t(
                  'games.sea_battle_v1.table.players.yourTurnAttack' as TranslationKey,
                ).replace('🎯 ', '')
              : activeName}
          </span>
        </div>
      </GlassCard>

      {teamMode ? (
        <div className="box-border flex flex-col gap-5 w-full items-center">
          {teams!.map((team) => {
            const teamPlayers = team.playerIds
              .map((id) => playerById.get(id))
              .filter((p): p is SeaBattlePlayerState => !!p);
            if (teamPlayers.length === 0) return null;
            return (
              <div
                className="box-border flex flex-col gap-3 w-full items-center"
                key={team.id}
              >
                <div
                  className="box-border flex flex-row items-center gap-2 px-3 rounded-[20px] bg-[rgba(0,0,0,0.4)] border border-l-[4px] border-[rgba(255,255,255,0.1)]"
                  style={{ borderLeftColor: team.color }}
                >
                  <div
                    className="box-border flex flex-col items-stretch w-[10px] h-[10px] rounded-[100px]"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="box-border text-[14px] font-bold text-[white]">
                    {team.name}
                  </span>
                </div>
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
                      shipCount={shipCount}
                      t={t}
                    />
                  ))}
                </SeaBattleGrids>
              </div>
            );
          })}
        </div>
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
              shipCount={shipCount}
              t={t}
            />
          ))}
        </SeaBattleGrids>
      )}
    </div>
  );
}
