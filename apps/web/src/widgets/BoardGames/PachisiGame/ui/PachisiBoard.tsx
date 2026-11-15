'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useWidgetFullscreen } from '@/features/games/ui/GameWidgetContainer';
import { usePachisiDiceState, usePachisiKeyboardTurn } from '../hooks';
import { usePachisiTheme } from '../lib/PachisiThemeContext';
import { boardVars } from '../lib/theme';
import {
  LANE_COORDS,
  SEAT_START_OFFSETS,
  STAR_CELLS,
  TRACK_COORDS,
  absoluteCell,
  movableTokenIds,
} from '../lib/boardLayout';
import type { PachisiClientState } from '../types';
import { FINISH_PROGRESS, MAIN_PATH_STEPS } from '../types';
import { PachisiStatusStrip } from './PachisiStatusStrip';
import { PachisiYard } from './PachisiYard';
import { PachisiCenterHome } from './PachisiCenterHome';
import { PachisiTokenStack, type PlacedToken } from './PachisiTokenStack';
import { DiceOverlay } from './DiceOverlay';
import './styles/pachisi.scss';

const BOARD_ROTATIONS: Record<number, number> = { 0: 180, 1: 270, 2: 0, 3: 90 };

interface PachisiBoardProps {
  snapshot: PachisiClientState;
  currentUserId: string | null;
  myTurn: boolean;
  actionBusy?: boolean;
  onRoll: () => void;
  onMove: (tokenId: number) => void;
  onPassTurn?: () => void;
  highlightedCells?: { row: number; col: number }[];
}

interface LastMove {
  tokenId: number;
  fromCell: number;
  toCell: number;
  timestamp: number;
}

function buildTokenPositionMap(
  snapshot: PachisiClientState,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const playerId of snapshot.playerOrder) {
    const seat = snapshot.seats[playerId];
    if (seat === undefined) continue;
    for (const token of snapshot.tokens[playerId] ?? []) {
      map.set(`${playerId}:${token.id}`, token.progress);
    }
  }
  return map;
}

export function PachisiBoard({
  snapshot,
  currentUserId,
  myTurn,
  actionBusy = false,
  onRoll,
  onMove,
  onPassTurn,
  highlightedCells = [],
}: PachisiBoardProps) {
  const theme = usePachisiTheme();
  const isFullscreen = useWidgetFullscreen();

  const {
    extracted,
    isLastRollNoMoves,
    canRoll,
    canMove,
    isGameOver,
    isRolling,
    isExtraRoll,
    myLastDie,
    effectiveLastDie,
  } = usePachisiDiceState(snapshot, currentUserId, myTurn, actionBusy);

  const mySeat = currentUserId ? snapshot.seats[currentUserId] : undefined;
  const boardRotation = mySeat != null ? (BOARD_ROTATIONS[mySeat] ?? 0) : 0;

  const prevPositions = useRef<Map<string, number>>(new Map());
  const [lastMove, setLastMove] = useState<LastMove | null>(null);

  useEffect(() => {
    const prev = prevPositions.current;
    const curr = buildTokenPositionMap(snapshot);
    const now = Date.now();
    if (prev.size > 0) {
      for (const [key, progress] of curr) {
        const prevProgress = prev.get(key);
        if (prevProgress != null && prevProgress !== progress) {
          const [playerId, tokId] = key.split(':');
          const seat = snapshot.seats[playerId];
          if (seat == null) continue;
          const fromCell =
            prevProgress >= 0 && prevProgress < MAIN_PATH_STEPS
              ? absoluteCell(seat, prevProgress)
              : -1;
          const toCell =
            progress >= 0 && progress < MAIN_PATH_STEPS
              ? absoluteCell(seat, progress)
              : -1;
          if (fromCell !== -1 || toCell !== -1) {
            setLastMove({
              tokenId: Number(tokId),
              fromCell,
              toCell,
              timestamp: now,
            });
          }
          break;
        }
      }
    }
    prevPositions.current = curr;
  }, [snapshot, snapshot.playerOrder, snapshot.seats, snapshot.tokens]);

  const movable = useMemo(
    () =>
      canMove && currentUserId
        ? movableTokenIds(snapshot.tokens[currentUserId], snapshot.die)
        : new Set<number>(),
    [canMove, currentUserId, snapshot.die, snapshot.tokens],
  );

  usePachisiKeyboardTurn({
    myTurn,
    isGameOver,
    actionBusy,
    canMove,
    movableTokenIds: movable,
    onPassTurn,
    onMove,
  });

  const highlightedTrackCells = useMemo(() => {
    const indices = new Set<number>();
    for (const cell of highlightedCells) {
      const matchIdx = TRACK_COORDS.findIndex(
        ([r, c]) => r === cell.row && c === cell.col,
      );
      if (matchIdx >= 0) indices.add(matchIdx);
    }
    return indices;
  }, [highlightedCells]);

  const trackTokens = useMemo(() => {
    const map = new Map<number, PlacedToken[]>();
    for (const playerId of snapshot.playerOrder) {
      const seat = snapshot.seats[playerId];
      if (seat === undefined) continue;
      for (const token of snapshot.tokens[playerId] ?? []) {
        if (token.progress < 0 || token.progress >= MAIN_PATH_STEPS) continue;
        const cell = absoluteCell(seat, token.progress);
        const list = map.get(cell) ?? [];
        list.push({ ownerId: playerId, seat, token });
        map.set(cell, list);
      }
    }
    return map;
  }, [snapshot.playerOrder, snapshot.seats, snapshot.tokens]);

  const finishedCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const playerId of snapshot.playerOrder) {
      counts.set(
        playerId,
        (snapshot.tokens[playerId] ?? []).filter(
          (tok) => tok.progress === FINISH_PROGRESS,
        ).length,
      );
    }
    return counts;
  }, [snapshot.playerOrder, snapshot.tokens]);

  const seatOf = (playerId: string): number => snapshot.seats[playerId] ?? 0;
  const playerAtSeat = (seat: number): string | null =>
    snapshot.playerOrder.find((pid) => snapshot.seats[pid] === seat) ?? null;
  const activeSeat =
    myTurn && currentUserId ? snapshot.seats[currentUserId] : undefined;

  return (
    <div
      className="box-border flex w-full flex-col items-center gap-3 select-none"
      style={boardVars(theme)}
    >
      <PachisiStatusStrip
        actionBusy={actionBusy}
        canMove={canMove}
        canRoll={canRoll}
        currentUserId={currentUserId}
        finishedCounts={finishedCounts}
        isGameOver={isGameOver}
        isLastRollNoMoves={isLastRollNoMoves}
        lastDie={effectiveLastDie}
        lastRollerId={
          isExtraRoll ? currentUserId : (extracted?.rollerId ?? null)
        }
        movableCount={movable.size}
        myLastDie={isExtraRoll ? 6 : myLastDie}
        myTurn={myTurn}
        onPassTurn={onPassTurn}
        snapshot={snapshot}
      />

      <div
        className={`pachisi-board pachisi-board-rot-${boardRotation} relative aspect-square w-full ${isFullscreen ? 'max-h-[calc(100dvh-130px)] max-w-[calc(100dvh-130px)]' : 'max-h-[calc(100dvh-170px)] max-w-[calc(100dvh-170px)]'} overflow-hidden rounded-2xl border-2 backdrop-blur-xl shrink-0 mx-auto`}
        data-testid="pachisi-board"
      >
        {[0, 1, 2, 3].map((seat) => {
          const owner = playerAtSeat(seat);
          const ownerTokens = owner ? (snapshot.tokens[owner] ?? []) : [];
          return (
            <PachisiYard
              key={`yard-${seat}`}
              seat={seat}
              ownerId={owner}
              currentUserId={currentUserId}
              isActive={seat === activeSeat}
              tokens={ownerTokens}
              movable={movable}
              onMove={onMove}
            />
          );
        })}

        {TRACK_COORDS.map(([row, col], idx) => {
          const isStar = STAR_CELLS.has(idx);
          const startSeat = SEAT_START_OFFSETS.findIndex((off) => off === idx);
          const occupants = trackTokens.get(idx) ?? [];
          const cellClass =
            startSeat >= 0 ? `pachisi-cell-seat-${startSeat}` : 'pachisi-cell';
          const isHighlight =
            lastMove?.fromCell === idx || lastMove?.toCell === idx;
          const highlightClass = isHighlight
            ? 'pachisi-cell-highlight'
            : highlightedTrackCells.has(idx)
              ? 'ring-2 ring-indigo-400/80 bg-indigo-500/20 animate-pulse'
              : '';
          return (
            <div
              key={`track-${idx}`}
              className={`pachisi-row-${row + 1} pachisi-col-${col + 1} relative m-[4%] flex items-center justify-center rounded-md border ${cellClass} ${highlightClass}`}
              data-testid={`cell-${idx}`}
            >
              {isStar && (
                <span className="pachisi-cell-star pointer-events-none absolute inset-0 flex items-center justify-center text-[9px] font-bold drop-shadow-sm">
                  ★
                </span>
              )}
              {occupants.length > 0 && (
                <PachisiTokenStack
                  cellKey={`${idx}`}
                  currentUserId={currentUserId}
                  canMove={canMove}
                  movable={movable}
                  onMove={onMove}
                  tokens={occupants}
                  isLandingCell={lastMove?.toCell === idx}
                />
              )}
            </div>
          );
        })}

        {[0, 1, 2, 3].flatMap((seat) =>
          LANE_COORDS[seat].map(([row, col], laneIdx) => {
            const owner = playerAtSeat(seat);
            const occupants: PlacedToken[] = owner
              ? (snapshot.tokens[owner] ?? [])
                  .filter((tok) => tok.progress === MAIN_PATH_STEPS + laneIdx)
                  .map((token) => ({ ownerId: owner, seat, token }))
              : [];
            return (
              <div
                key={`lane-${seat}-${laneIdx}`}
                className={`pachisi-lane-seat-${seat} pachisi-row-${row + 1} pachisi-col-${col + 1} relative m-[10%] rounded-md border`}
                data-testid={`lane-cell-${seat}-${laneIdx}`}
              >
                {occupants.length > 0 && (
                  <PachisiTokenStack
                    cellKey={`lane-token-${seat}-${laneIdx}`}
                    currentUserId={currentUserId}
                    canMove={canMove}
                    movable={movable}
                    onMove={onMove}
                    tokens={occupants}
                  />
                )}
              </div>
            );
          }),
        )}

        <PachisiCenterHome
          finishedCounts={finishedCounts}
          seatOf={seatOf}
          snapshot={snapshot}
        />

        <DiceOverlay
          actionBusy={actionBusy}
          boardRotation={boardRotation}
          canRoll={canRoll}
          die={snapshot.die}
          isExtraRoll={isExtraRoll}
          isGameOver={isGameOver}
          isRolling={isRolling}
          lastDie={effectiveLastDie}
          myLastDie={isExtraRoll ? 6 : myLastDie}
          onRoll={onRoll}
        />
      </div>
    </div>
  );
}
