'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { BOARD_CELL_FOCUS_CLASS } from '@/shared/lib/keyboard-navigation';
import { useWidgetFullscreen } from '@/features/games/ui/GameWidgetContainer';
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
import type { PachisiClientState, PachisiToken } from '../types';
import { FINISH_PROGRESS, MAIN_PATH_STEPS } from '../types';
import { PachisiStatusStrip } from './PachisiStatusStrip';
import { PachisiTokenView } from './PachisiTokenView';
import { PachisiYard } from './PachisiYard';
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
}

interface PlacedToken {
  ownerId: string;
  seat: number;
  token: PachisiToken;
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

function extractLastRoll(snapshot: PachisiClientState): {
  die: number;
  rollerId: string | null;
} | null {
  if (snapshot.die != null) {
    return {
      die: snapshot.die,
      rollerId: snapshot.playerOrder[snapshot.currentTurnIndex] ?? null,
    };
  }
  if (snapshot.lastDie != null) {
    return {
      die: snapshot.lastDie,
      rollerId: snapshot.lastRollerId ?? null,
    };
  }
  if (snapshot.logs && snapshot.logs.length > 0) {
    for (let i = snapshot.logs.length - 1; i >= 0; i--) {
      const entry = snapshot.logs[i];
      const match = entry.message.match(/rolled\s+(?:a\s+)?(\d+)/i);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val >= 1 && val <= 6) {
          return { die: val, rollerId: entry.senderId ?? null };
        }
      }
    }
  }
  return null;
}

function hasRecentNoMoves(snapshot: PachisiClientState): boolean {
  if (snapshot.phase === 'move') return false;
  if (!snapshot.logs || snapshot.logs.length === 0) return false;
  const lastEntry = snapshot.logs[snapshot.logs.length - 1];
  return Boolean(lastEntry?.message.toLowerCase().includes('no legal moves'));
}

export function PachisiBoard({
  snapshot,
  currentUserId,
  myTurn,
  actionBusy = false,
  onRoll,
  onMove,
  onPassTurn,
}: PachisiBoardProps) {
  const { t } = useTranslation();
  const theme = usePachisiTheme();
  const isFullscreen = useWidgetFullscreen();

  const extracted = useMemo(() => extractLastRoll(snapshot), [snapshot]);
  const isLastRollNoMoves = useMemo(
    () => hasRecentNoMoves(snapshot),
    [snapshot],
  );

  const [lastDie, setLastDie] = useState<number | null>(
    snapshot.die ?? snapshot.lastDie ?? extracted?.die ?? null,
  );
  if (
    (snapshot.die != null && snapshot.die !== lastDie) ||
    (extracted?.die != null && extracted.die !== lastDie)
  ) {
    setLastDie(snapshot.die ?? extracted?.die ?? null);
  }

  const isMyRoll =
    (myTurn && snapshot.die != null) ||
    (extracted?.rollerId != null && extracted.rollerId === currentUserId);

  const [myLastDie, setMyLastDie] = useState<number | null>(
    isMyRoll && (snapshot.die ?? extracted?.die) != null
      ? (snapshot.die ?? extracted?.die ?? null)
      : null,
  );
  if (
    isMyRoll &&
    (snapshot.die ?? extracted?.die) != null &&
    (snapshot.die ?? extracted?.die) !== myLastDie
  ) {
    setMyLastDie(snapshot.die ?? extracted?.die ?? null);
  }

  const effectiveLastDie = myLastDie ?? lastDie ?? extracted?.die ?? null;

  const canRoll = myTurn && snapshot.phase === 'roll';
  const canMove = myTurn && snapshot.phase === 'move';
  const isGameOver = snapshot.phase === 'game_over';
  const isRolling =
    actionBusy && snapshot.phase === 'roll' && snapshot.die == null;

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
  const isMovableToken = (placed: PlacedToken): boolean =>
    canMove && placed.ownerId === currentUserId && movable.has(placed.token.id);
  const activeSeat =
    myTurn && currentUserId ? snapshot.seats[currentUserId] : undefined;

  const renderPlacedToken = (
    placed: PlacedToken,
    i: number,
    stackSize: number,
    cellKey: string,
  ) => {
    const movableToken = isMovableToken(placed);
    let layoutClass = 'aspect-square h-[74%] w-[74%] shrink-0';
    if (stackSize === 2) {
      layoutClass =
        i === 0
          ? 'aspect-square h-[60%] w-[60%] shrink-0 -translate-x-1.5 -translate-y-1.5'
          : 'aspect-square h-[60%] w-[60%] shrink-0 translate-x-1.5 translate-y-1.5';
    } else if (stackSize >= 3) {
      const offsets = [
        '-translate-x-1.5 -translate-y-1.5',
        'translate-x-1.5 -translate-y-1.5',
        '-translate-x-1.5 translate-y-1.5',
        'translate-x-1.5 translate-y-1.5',
      ];
      layoutClass = `aspect-square h-[48%] w-[48%] shrink-0 ${offsets[i % 4]}`;
    }

    const zIndexClass = movableToken ? 'z-30' : i === 0 ? 'z-10' : 'z-20';
    const testId = cellKey.startsWith('lane-')
      ? stackSize === 1 || i === 0
        ? cellKey
        : `${cellKey}-${placed.token.id}`
      : `token-cell-${cellKey}-${placed.token.id}`;

    return (
      <PachisiTokenView
        key={`${placed.ownerId}-${placed.token.id}`}
        seat={placed.seat}
        isMovable={movableToken}
        isButton={movableToken}
        ariaLabel={
          movableToken
            ? t('games.pachisi_v1.game.moveTokenAria', {
                id: placed.token.id,
              })
            : undefined
        }
        onClick={movableToken ? () => onMove(placed.token.id) : undefined}
        testId={testId}
        className={`pointer-events-auto absolute ${layoutClass} ${zIndexClass} ${
          movableToken ? BOARD_CELL_FOCUS_CLASS : ''
        }`}
      />
    );
  };

  const renderTokenStack = (tokens: PlacedToken[], cellKey: string) => (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative flex h-full w-full items-center justify-center">
        {tokens.map((placed, i) =>
          renderPlacedToken(placed, i, tokens.length, cellKey),
        )}
        {tokens.length > 1 && (
          <span className="pointer-events-none absolute -top-1 -right-1 z-30 rounded-full bg-black/85 px-1 py-0.2 text-[8px] font-black text-white shadow-sm ring-1 ring-white/30">
            {tokens.length}
          </span>
        )}
      </div>
    </div>
  );

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
        lastRollerId={extracted?.rollerId ?? null}
        movableCount={movable.size}
        myLastDie={myLastDie}
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
          const highlightClass =
            lastMove?.fromCell === idx || lastMove?.toCell === idx
              ? 'pachisi-cell-highlight'
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
              {occupants.length > 0 && renderTokenStack(occupants, `${idx}`)}
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
                {occupants.length > 0 &&
                  renderTokenStack(occupants, `lane-token-${seat}-${laneIdx}`)}
              </div>
            );
          }),
        )}

        <div className="pachisi-center-home pachisi-center-home-area relative z-10 m-[6%] flex items-center justify-center rounded-lg border shadow-inner">
          <div className="pachisi-center-home-content relative h-full w-full">
            {snapshot.playerOrder.map((pid) => {
              const seat = seatOf(pid);
              const finished = finishedCounts.get(pid) ?? 0;
              const posClass =
                seat === 0
                  ? 'left-1 top-1/2 -translate-y-1/2'
                  : seat === 1
                    ? 'top-1 left-1/2 -translate-x-1/2'
                    : seat === 2
                      ? 'right-1 top-1/2 -translate-y-1/2'
                      : 'bottom-1 left-1/2 -translate-x-1/2';
              return (
                <span
                  key={`home-count-${pid}`}
                  className={`pachisi-score-pill-seat-${seat} absolute ${posClass} flex items-center gap-0.5 rounded-full px-1 text-[9px] font-black text-white shadow-sm`}
                >
                  ● {finished}
                </span>
              );
            })}
          </div>
        </div>

        <DiceOverlay
          actionBusy={actionBusy}
          boardRotation={boardRotation}
          canRoll={canRoll}
          die={snapshot.die}
          isGameOver={isGameOver}
          isRolling={isRolling}
          lastDie={effectiveLastDie}
          myLastDie={myLastDie}
          onRoll={onRoll}
        />
      </div>
    </div>
  );
}
