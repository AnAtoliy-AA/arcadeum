'use client';
import { memo, useMemo } from 'react';
import type { SeaBattlePlayerState, SeaBattleTeam } from '../../types';
import { MainGameArea } from '../styles';
import { SeaBattleGrids } from '../SeaBattleGrids';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useSeaBattleTheme } from '../../lib/SeaBattleThemeContext';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { AttackPlayerBoard } from './AttackPlayerBoard';

export interface AttackBoardProps {
  players: SeaBattlePlayerState[];
  currentUserId: string | null;
  currentTurnPlayerId: string | null;
  isMyTurn: boolean;
  onAttack: (targetPlayerId: string, row: number, col: number) => void;
  resolveDisplayName: (id: string, fallback: string) => string;
  disabled?: boolean;
  teammateIds?: string[];
  teams?: SeaBattleTeam[];
  gridSize?: number;
}

export const AttackBoard = memo(function AttackBoard({
  players,
  currentUserId,
  currentTurnPlayerId,
  isMyTurn,
  onAttack,
  resolveDisplayName,
  disabled = false,
  teammateIds,
  teams,
}: AttackBoardProps) {
  const { t } = useTranslation();
  const theme = useSeaBattleTheme();

  const currentPlayer = useMemo(
    () => players.find((p) => p.playerId === currentUserId) || null,
    [players, currentUserId],
  );

  const opponents = useMemo(
    () => players.filter((p) => p.playerId !== currentUserId && p.alive),
    [players, currentUserId],
  );

  const idlePlayers = useGameStore((s: GameState) => s.idlePlayers);

  const sunkCellSet = useMemo(() => {
    const set = new Set<string>();
    players.forEach((p) => {
      p.ships
        .filter((s) => s.sunk)
        .forEach((s) => {
          s.cells.forEach((c) => set.add(`${p.playerId}-${c.row}-${c.col}`));
        });
    });
    return set;
  }, [players]);

  return (
    <MainGameArea data-testid="game-main-area">
      <SeaBattleGrids>
        {currentPlayer && (
          <AttackPlayerBoard
            player={currentPlayer}
            isMe={true}
            theme={theme}
            resolveDisplayName={resolveDisplayName}
            idlePlayers={idlePlayers}
            isCurrentTurn={currentPlayer.playerId === currentTurnPlayerId}
            isMyTurn={isMyTurn}
            disabled={disabled}
            team={teams?.find((tt) =>
              tt.playerIds.includes(currentPlayer.playerId),
            )}
            sunkCellSet={sunkCellSet}
            t={t}
          />
        )}

        {opponents.map((opponent) => {
          const isTeammate = !!teammateIds?.includes(opponent.playerId);
          const team = teams?.find((tt) =>
            tt.playerIds.includes(opponent.playerId),
          );
          return (
            <AttackPlayerBoard
              key={opponent.playerId}
              player={opponent}
              isMe={false}
              theme={theme}
              resolveDisplayName={resolveDisplayName}
              idlePlayers={idlePlayers}
              isCurrentTurn={opponent.playerId === currentTurnPlayerId}
              isMyTurn={isMyTurn}
              disabled={disabled}
              isTeammate={isTeammate}
              team={team}
              sunkCellSet={sunkCellSet}
              onAttack={isTeammate ? undefined : onAttack}
              t={t}
            />
          );
        })}
      </SeaBattleGrids>
    </MainGameArea>
  );
});
