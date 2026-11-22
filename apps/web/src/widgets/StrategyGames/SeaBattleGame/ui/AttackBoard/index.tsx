'use client';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type {
  SeaBattlePlayerState,
  SeaBattleSnapshot,
  SeaBattleTeam,
} from '../../types';
import { MainGameArea } from '../styles';
import { SeaBattleGrids } from '../SeaBattleGrids';
import { useTranslation } from '@/shared/i18n/useTranslation';
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
  weaponPreviewType?: 'sonar' | 'radar' | 'ability' | null;
  onCellHover?: (playerId: string, row: number, col: number) => void;
  onCellHoverEnd?: () => void;
  weaponMode?: boolean;
  showEliminatedPlayers?: boolean;
  keyboardCursor?: { row: number; col: number } | null;
  highlightedCells?: { row: number; col: number }[];
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
  keyboardCursor,
  highlightedCells = [],
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

  // Scan wave: show all ships for a limited duration when battle starts or room is re-entered
  const [scanWaveActive, setScanWaveActive] = useState(false);
  const scanWaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playedScanWaveRef = useRef<string | null>(null);

  useEffect(() => {
    if (snapshot?.phase === 'lobby' || snapshot?.phase === 'placement') {
      playedScanWaveRef.current = null;
      if (scanWaveTimerRef.current) {
        clearTimeout(scanWaveTimerRef.current);
        scanWaveTimerRef.current = null;
      }
      setScanWaveActive(false);
      return;
    }
    const sw = snapshot?.lastScanWave;
    if (!sw || snapshot?.phase !== 'battle') return;

    // Trigger animation when entering battle or if lastScanWave changes
    const waveId = JSON.stringify(sw.cells.map((c) => c.playerId));
    if (playedScanWaveRef.current === waveId) return;

    playedScanWaveRef.current = waveId;
    setScanWaveActive(true);
    if (scanWaveTimerRef.current) {
      clearTimeout(scanWaveTimerRef.current);
    }
    scanWaveTimerRef.current = setTimeout(() => {
      setScanWaveActive(false);
      scanWaveTimerRef.current = null;
    }, sw.duration * 1000);
  }, [snapshot?.lastScanWave, snapshot?.phase]);

  const cachedScansRef = useRef<
    Map<string, { set: Set<string>; states: Map<string, number> }>
  >(new Map());

  const accumulatedScannedMap = useMemo(() => {
    if (snapshot?.phase !== 'battle') {
      cachedScansRef.current.clear();
      return new Map<
        string,
        { set: Set<string>; states: Map<string, number> }
      >();
    }

    const map = cachedScansRef.current;
    const scannedCells = snapshot?.scannedCells;
    if (scannedCells) {
      for (const [targetId, cells] of Object.entries(scannedCells)) {
        let entry = map.get(targetId);
        if (!entry) {
          entry = { set: new Set<string>(), states: new Map<string, number>() };
          map.set(targetId, entry);
        }
        for (const c of cells) {
          const key = `${targetId}-${c.row}-${c.col}`;
          entry.set.add(key);
          entry.states.set(key, c.state);
        }
      }
    }

    if (effectiveLastSonar) {
      const targetId = effectiveLastSonar.targetId;
      let entry = map.get(targetId);
      if (!entry) {
        entry = { set: new Set<string>(), states: new Map<string, number>() };
        map.set(targetId, entry);
      }
      for (const c of effectiveLastSonar.cells) {
        const key = `${targetId}-${c.row}-${c.col}`;
        entry.set.add(key);
        entry.states.set(key, c.state);
      }
    }

    const result = new Map<
      string,
      { set: Set<string>; states: Map<string, number> }
    >();
    for (const [targetId, entry] of map.entries()) {
      result.set(targetId, {
        set: new Set(entry.set),
        states: new Map(entry.states),
      });
    }
    return result;
  }, [snapshot?.phase, snapshot?.scannedCells, effectiveLastSonar]);

  const radarHighlightSet = useMemo(() => {
    const lr = effectiveLastRadar;
    if (!lr) return null;
    const set = new Set<string>();
    lr.cells.forEach((c) => set.add(`${lr.targetId}-${c.row}-${c.col}`));
    return set;
  }, [effectiveLastRadar]);

  const radarCellStates = useMemo(() => {
    const lr = effectiveLastRadar;
    if (!lr) return null;
    const map = new Map<string, number>();
    lr.cells.forEach((c) =>
      map.set(`${lr.targetId}-${c.row}-${c.col}`, c.state),
    );
    return map;
  }, [effectiveLastRadar]);

  const chatHighlightSet = useMemo(() => {
    if (highlightedCells.length === 0) return null;
    const set = new Set<string>();
    for (const cell of highlightedCells) {
      for (const opponent of opponents) {
        set.add(`${opponent.playerId}-${cell.row}-${cell.col}`);
      }
    }
    return set;
  }, [highlightedCells, opponents]);

  // Scan wave: highlight sets for all opponents
  const scanWaveHighlightSets = useMemo(() => {
    if (!scanWaveActive || !snapshot?.lastScanWave) return null;
    const map = new Map<string, Set<string>>();
    const cellMap = new Map<string, Map<string, number>>();
    for (const entry of snapshot.lastScanWave.cells) {
      const set = new Set<string>();
      const states = new Map<string, number>();
      for (let r = 0; r < entry.board.length; r++) {
        for (let c = 0; c < entry.board[r].length; c++) {
          const key = `${entry.playerId}-${r}-${c}`;
          set.add(key);
          states.set(key, entry.board[r][c]);
        }
      }
      map.set(entry.playerId, set);
      cellMap.set(entry.playerId, states);
    }
    return { highlights: map, states: cellMap };
  }, [scanWaveActive, snapshot]);

  // Pre-build team lookup for opponents map to avoid repeated teams.find() per render
  const playerTeamMap = useMemo(() => {
    if (!teams) return null;
    const map = new Map<string, SeaBattleTeam>();
    for (const team of teams) {
      for (const pid of team.playerIds) {
        map.set(pid, team);
      }
    }
    return map;
  }, [teams]);

  const currentPlayerTeam = useMemo(
    () =>
      currentPlayer
        ? (playerTeamMap?.get(currentPlayer.playerId) ?? undefined)
        : undefined,
    [currentPlayer, playerTeamMap],
  );

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
            team={currentPlayerTeam}
            shipCount={shipCount}
            t={t}
          />
        )}

        {opponents.map((opponent) => {
          const isTeammate = !!teammateIds?.includes(opponent.playerId);
          const team = playerTeamMap?.get(opponent.playerId);
          const opponentScans = accumulatedScannedMap.get(opponent.playerId);
          const isRadarTarget =
            effectiveLastRadar?.targetId === opponent.playerId;
          const scanWaveSet =
            scanWaveHighlightSets?.highlights.get(opponent.playerId) ?? null;
          const scanWaveStates =
            scanWaveHighlightSets?.states.get(opponent.playerId) ?? null;
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
              shipCount={shipCount}
              sonarHighlightCells={opponentScans?.set ?? null}
              sonarCellStates={opponentScans?.states ?? null}
              radarHighlightCells={isRadarTarget ? radarHighlightSet : null}
              radarCellStates={isRadarTarget ? radarCellStates : null}
              scanWaveHighlightCells={scanWaveSet}
              scanWaveCellStates={scanWaveStates}
              chatHighlightCells={chatHighlightSet}
              weaponPreviewCells={weaponPreviewCells}
              weaponPreviewType={weaponPreviewType}
              onAttack={onAttack}
              onCellHover={onCellHover}
              onCellHoverEnd={onCellHoverEnd}
              weaponMode={weaponMode}
              keyboardCursor={
                opponents.indexOf(opponent) === 0 ? keyboardCursor : null
              }
              t={t}
            />
          );
        })}
      </SeaBattleGrids>
    </MainGameArea>
  );
});
