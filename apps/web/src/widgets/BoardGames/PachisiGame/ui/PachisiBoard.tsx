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
import { FINISH_PROGRESS, MAIN_PATH_STEPS, YARD_PROGRESS } from '../types';
import { PachisiStatusStrip } from './PachisiStatusStrip';
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

  const [lastDie, setLastDie] = useState<number | null>(snapshot.die);
  if (snapshot.die != null && snapshot.die !== lastDie) {
    setLastDie(snapshot.die);
  }

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

  useEffect(() => {
    if (!lastMove) return;
    const id = setTimeout(() => setLastMove(null), 2000);
    return () => clearTimeout(id);
  }, [lastMove]);

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
        if (token.progress < YARD_PROGRESS || token.progress >= MAIN_PATH_STEPS)
          continue;
        const cell = absoluteCell(seat, token.progress);
        const list = map.get(cell) ?? [];
        list.push({ ownerId: playerId, seat, token });
        map.set(cell, list);
      }
    }
    return map;
  }, [snapshot.playerOrder, snapshot.seats, snapshot.tokens]);

  const yardTokens = useMemo(() => {
    const bySeat = new Map<number, PachisiToken[]>();
    for (const playerId of snapshot.playerOrder) {
      const seat = snapshot.seats[playerId];
      if (seat === undefined) continue;
      const yard = (snapshot.tokens[playerId] ?? []).filter(
        (tok) => tok.progress === YARD_PROGRESS,
      );
      if (yard.length > 0) bySeat.set(seat, yard);
    }
    return bySeat;
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
    const offsetClass =
      stackSize > 1 ? (i % 2 === 0 ? '-translate-y-1' : 'translate-y-1') : '';
    if (movableToken) {
      return (
        <button
          key={`${placed.ownerId}-${placed.token.id}`}
          aria-label={t('games.pachisi_v1.game.moveTokenAria', {
            id: placed.token.id,
          })}
          className={`pachisi-token pachisi-token-seat-${placed.seat} pointer-events-auto z-30 cursor-pointer absolute h-[72%] w-[72%] animate-bounce rounded-full border-2 shadow-md ring-2 ring-white/90 transition-transform hover:scale-110 active:scale-95 ${offsetClass} ${BOARD_CELL_FOCUS_CLASS}`}
          onClick={() => onMove(placed.token.id)}
          type="button"
          data-testid={`token-cell-${cellKey}-${placed.token.id}`}
        />
      );
    }
    return (
      <span
        key={`${placed.ownerId}-${placed.token.id}`}
        className={`pachisi-token pachisi-token-seat-${placed.seat} absolute h-[72%] w-[72%] rounded-full border shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.25)] ${offsetClass}`}
        data-testid={`token-cell-${cellKey}-${placed.token.id}`}
      />
    );
  };

  const renderTokenStack = (tokens: PlacedToken[], cellKey: string) => (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative flex h-full w-full items-center justify-center">
        {tokens.map((placed, i) =>
          renderPlacedToken(placed, i, tokens.length, cellKey),
        )}
        {tokens.length > 1 && !tokens.some(isMovableToken) && (
          <span className="z-10 rounded-full bg-black/70 px-1 text-[8px] font-black text-white shadow-sm">
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
        lastDie={lastDie}
        movableCount={movable.size}
        myTurn={myTurn}
        onPassTurn={onPassTurn}
        snapshot={snapshot}
      />

      <div
        className={`pachisi-board relative aspect-square w-full ${isFullscreen ? 'max-h-[calc(100dvh-130px)] max-w-[calc(100dvh-130px)]' : 'max-h-[calc(100dvh-170px)] max-w-[calc(100dvh-170px)]'} overflow-hidden rounded-2xl border-2 backdrop-blur-xl shrink-0 mx-auto`}
        data-testid="pachisi-board"
        style={{ transform: `rotate(${boardRotation}deg)` }}
      >
        {[0, 1, 2, 3].map((seat) => {
          const owner = playerAtSeat(seat);
          const yard = yardTokens.get(seat) ?? [];
          const slotCount =
            owner != null ? (snapshot.tokens[owner]?.length ?? 4) : 4;
          const isMine = owner != null && owner === currentUserId;
          const isActive = seat === activeSeat;
          return (
            <div
              key={`yard-${seat}`}
              className={`pachisi-yard pachisi-yard-area-${seat} m-[5%] flex items-center justify-center rounded-xl border p-[8%] ${owner != null ? `pachisi-yard-seat-${seat} border-2` : 'border'} ${isActive ? 'pachisi-yard-active' : ''}`}
              style={
                isActive
                  ? ({
                      '--pachisi-glow-color': `color-mix(in srgb, var(--pachisi-seat-${seat}) 50%, transparent)`,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <div className="grid aspect-square h-auto w-full grid-cols-2 grid-rows-2 place-items-center">
                {Array.from({ length: Math.max(slotCount, 4) }).map(
                  (_, slot) => {
                    const tok = yard[slot];
                    const clickable = !!tok && isMine && movable.has(tok.id);
                    if (clickable && tok) {
                      return (
                        <button
                          key={`yard-slot-${seat}-${slot}`}
                          aria-label={t('games.pachisi_v1.game.moveTokenAria', {
                            id: tok.id,
                          })}
                          className={`pachisi-token pachisi-token-seat-${seat} pointer-events-auto z-30 aspect-square w-[62%] animate-bounce cursor-pointer rounded-full border shadow-md ring-2 ring-white/90 transition-transform hover:scale-110 active:scale-95 ${BOARD_CELL_FOCUS_CLASS}`}
                          data-testid={`yard-token-${seat}-${slot}`}
                          onClick={() => onMove(tok.id)}
                          type="button"
                        />
                      );
                    }
                    return (
                      <span
                        key={`yard-slot-${seat}-${slot}`}
                        className={`aspect-square w-[62%] rounded-full border shadow-md ${tok ? `pachisi-token pachisi-token-seat-${seat} opacity-100 shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.25)]` : 'pachisi-cell border-dashed opacity-30'}`}
                        data-testid={`yard-token-${seat}-${slot}`}
                      />
                    );
                  },
                )}
              </div>
            </div>
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
            const occupant = owner
              ? (snapshot.tokens[owner] ?? []).find(
                  (tok) => tok.progress === MAIN_PATH_STEPS + laneIdx,
                )
              : undefined;
            const movableOccupant =
              canMove && owner === currentUserId && occupant !== undefined
                ? movable.has(occupant.id)
                : false;
            return (
              <div
                key={`lane-${seat}-${laneIdx}`}
                className={`pachisi-lane-seat-${seat} pachisi-row-${row + 1} pachisi-col-${col + 1} relative m-[10%] rounded-md border`}
                data-testid={`lane-cell-${seat}-${laneIdx}`}
              >
                {occupant &&
                  (movableOccupant ? (
                    <button
                      aria-label={t('games.pachisi_v1.game.moveTokenAria', {
                        id: occupant.id,
                      })}
                      className={`pointer-events-auto z-30 cursor-pointer absolute inset-0 flex animate-bounce items-center justify-center rounded-md active:scale-95 ${BOARD_CELL_FOCUS_CLASS}`}
                      data-testid={`lane-token-${seat}-${laneIdx}`}
                      onClick={() => onMove(occupant.id)}
                      type="button"
                    >
                      <span
                        className={`pachisi-token pachisi-token-seat-${seat} block h-[72%] w-[72%] rounded-full border-2 shadow-md ring-2 ring-white/90 transition-transform hover:scale-110`}
                      />
                    </button>
                  ) : (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span
                        className={`pachisi-token pachisi-token-seat-${seat} block h-[72%] w-[72%] rounded-full border shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.25)]`}
                      />
                    </div>
                  ))}
              </div>
            );
          }),
        )}

        <div className="pachisi-center-home pachisi-center-home-area relative z-10 m-[6%] flex items-center justify-center rounded-lg border shadow-inner">
          <div
            className="grid grid-cols-2 place-items-center gap-x-2 gap-y-0.5 px-1"
            style={{ transform: `rotate(${-boardRotation}deg)` }}
          >
            {snapshot.playerOrder.map((pid) => {
              const seat = seatOf(pid);
              const finished = finishedCounts.get(pid) ?? 0;
              return (
                <span
                  key={`home-count-${pid}`}
                  className={`pachisi-score-pill-seat-${seat} flex items-center gap-0.5 rounded-full px-1 text-[10px] font-black text-white`}
                >
                  ● {finished}
                </span>
              );
            })}
          </div>
        </div>

        <DiceOverlay
          canRoll={canRoll}
          isRolling={isRolling}
          isGameOver={isGameOver}
          actionBusy={actionBusy}
          die={snapshot.die}
          lastDie={lastDie}
          boardRotation={boardRotation}
          onRoll={onRoll}
        />
      </div>
    </div>
  );
}
