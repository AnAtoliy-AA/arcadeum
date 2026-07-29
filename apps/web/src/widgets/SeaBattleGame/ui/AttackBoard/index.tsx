'use client';
import { memo, useMemo, useState } from 'react';
import type {
  SeaBattlePlayerState,
  SeaBattleSnapshot,
  SeaBattleTeam,
} from '../../types';
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
  shipCount?: number;
  snapshot?: SeaBattleSnapshot | null;
  weaponPreviewCells?: Set<string> | null;
  weaponPreviewType?: 'sonar' | 'radar' | null;
  onCellHover?: (playerId: string, row: number, col: number) => void;
  onCellHoverEnd?: () => void;
  weaponMode?: boolean;
  showEliminatedPlayers?: boolean;
}

export function getVisibleOpponents<
  T extends Pick<SeaBattlePlayerState, 'playerId' | 'alive'>,
>(
  players: T[],
  currentUserId: string | null,
  showEliminatedPlayers: boolean,
): T[] {
  return players.filter(
    (player) =>
      player.playerId !== currentUserId &&
      (showEliminatedPlayers || player.alive),
  );
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
  snapshot,
  shipCount,
  weaponPreviewCells,
  weaponPreviewType,
  onCellHover,
  onCellHoverEnd,
  weaponMode,
  showEliminatedPlayers = false,
}: AttackBoardProps) {
  const { t } = useTranslation();
  const theme = useSeaBattleTheme();

  const currentPlayer = useMemo(
    () => players.find((p) => p.playerId === currentUserId) || null,
    [players, currentUserId],
  );

  const opponents = useMemo(
    () => getVisibleOpponents(players, currentUserId, showEliminatedPlayers),
    [players, currentUserId, showEliminatedPlayers],
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

  // Cache lastSonar/lastRadar across state updates — they may disappear
  // from the snapshot after a re-broadcast but should remain visible until
  // a new weapon is used or the game ends.
  const [cachedLastSonar, setCachedLastSonar] = useState(
    () => snapshot?.lastSonar ?? null,
  );
  const [cachedLastRadar, setCachedLastRadar] = useState(
    () => snapshot?.lastRadar ?? null,
  );

  const nextCachedSonar =
    snapshot?.phase !== 'battle'
      ? null
      : (snapshot?.lastSonar ?? cachedLastSonar);
  const nextCachedRadar =
    snapshot?.phase !== 'battle'
      ? null
      : (snapshot?.lastRadar ?? cachedLastRadar);
  if (nextCachedSonar !== cachedLastSonar) setCachedLastSonar(nextCachedSonar);
  if (nextCachedRadar !== cachedLastRadar) setCachedLastRadar(nextCachedRadar);

  const effectiveLastSonar = snapshot?.lastSonar ?? cachedLastSonar;
  const effectiveLastRadar = snapshot?.lastRadar ?? cachedLastRadar;

  const sonarHighlightSet = (() => {
    const ls = effectiveLastSonar;
    if (!ls) return null;
    const set = new Set<string>();
    ls.cells.forEach((c) => set.add(`${ls.targetId}-${c.row}-${c.col}`));
    return set;
  })();

  // Map cellKey → state for sonar scanned cells (SHIP=1, EMPTY=0, etc.)
  const sonarCellStates = (() => {
    const ls = effectiveLastSonar;
    if (!ls) return null;
    const map = new Map<string, number>();
    ls.cells.forEach((c) =>
      map.set(`${ls.targetId}-${c.row}-${c.col}`, c.state),
    );
    return map;
  })();

  const radarHighlightSet = (() => {
    const lr = effectiveLastRadar;
    if (!lr) return null;
    const set = new Set<string>();
    lr.cells.forEach((c) => set.add(`${lr.targetId}-${c.row}-${c.col}`));
    return set;
  })();

  // Map cellKey → state for radar scanned cells
  const radarCellStates = (() => {
    const lr = effectiveLastRadar;
    if (!lr) return null;
    const map = new Map<string, number>();
    lr.cells.forEach((c) =>
      map.set(`${lr.targetId}-${c.row}-${c.col}`, c.state),
    );
    return map;
  })();

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
            shipCount={shipCount}
            t={t}
          />
        )}

        {opponents.map((opponent) => {
          const isTeammate = !!teammateIds?.includes(opponent.playerId);
          const team = teams?.find((tt) =>
            tt.playerIds.includes(opponent.playerId),
          );
          const isSonarTarget =
            effectiveLastSonar?.targetId === opponent.playerId;
          const isRadarTarget =
            effectiveLastRadar?.targetId === opponent.playerId;
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
              shipCount={shipCount}
              onAttack={isTeammate ? undefined : onAttack}
              sonarHighlightCells={isSonarTarget ? sonarHighlightSet : null}
              sonarCellStates={isSonarTarget ? sonarCellStates : null}
              radarHighlightCells={isRadarTarget ? radarHighlightSet : null}
              radarCellStates={isRadarTarget ? radarCellStates : null}
              weaponPreviewCells={
                weaponPreviewType && weaponPreviewCells
                  ? weaponPreviewCells
                  : null
              }
              weaponPreviewType={
                weaponPreviewType && weaponPreviewCells
                  ? weaponPreviewType
                  : null
              }
              onCellHover={isTeammate ? undefined : onCellHover}
              onCellHoverEnd={onCellHoverEnd}
              weaponMode={weaponMode}
              t={t}
            />
          );
        })}
      </SeaBattleGrids>
    </MainGameArea>
  );
});
