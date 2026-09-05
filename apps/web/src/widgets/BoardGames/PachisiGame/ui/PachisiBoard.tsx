'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
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
import './styles/pachisi.scss';

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

  const renderPlacedToken = (
    placed: PlacedToken,
    i: number,
    stackSize: number,
    cellKey: string,
  ) => {
    const movableToken = isMovableToken(placed);
    const shared = {
      'data-testid': `token-cell-${cellKey}-${placed.token.id}`,
    };
    const offsetClass =
      stackSize > 1 ? (i % 2 === 0 ? '-translate-y-1' : 'translate-y-1') : '';

    if (movableToken) {
      return (
        <button
          key={`${placed.ownerId}-${placed.token.id}`}
          aria-label={t('games.pachisi_v1.game.moveTokenAria', {
            id: placed.token.id,
          })}
          className={`pachisi-token pachisi-token-seat-${placed.seat} pointer-events-auto z-30 cursor-pointer absolute h-[72%] w-[72%] animate-bounce rounded-full border-2 shadow-md ring-2 ring-white/90 transition-transform hover:scale-110 ${offsetClass} ${BOARD_CELL_FOCUS_CLASS}`}
          onClick={() => onMove(placed.token.id)}
          type="button"
          {...shared}
        />
      );
    }
    return (
      <span
        key={`${placed.ownerId}-${placed.token.id}`}
        className={`pachisi-token pachisi-token-seat-${placed.seat} absolute h-[72%] w-[72%] rounded-full border shadow-md ${offsetClass}`}
        {...shared}
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
          <span className="z-10 rounded-full bg-black/70 px-1 text-[8px] font-black text-white">
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
        onRoll={onRoll}
        snapshot={snapshot}
      />

      <div
        className={`pachisi-board relative aspect-square w-full ${
          isFullscreen
            ? 'max-h-[calc(100dvh-130px)] max-w-[calc(100dvh-130px)]'
            : 'max-h-[calc(100dvh-170px)] max-w-[calc(100dvh-170px)]'
        } overflow-hidden rounded-2xl border-2 backdrop-blur-xl shrink-0 mx-auto`}
        data-testid="pachisi-board"
      >
        {[0, 1, 2, 3].map((seat) => {
          const owner = playerAtSeat(seat);
          const yard = yardTokens.get(seat) ?? [];
          const slotCount =
            owner != null ? (snapshot.tokens[owner]?.length ?? 4) : 4;
          const isMine = owner != null && owner === currentUserId;
          return (
            <div
              key={`yard-${seat}`}
              className={`pachisi-yard pachisi-yard-area-${seat} m-[5%] flex items-center justify-center rounded-xl border p-[8%] ${
                owner != null ? `pachisi-yard-seat-${seat} border-2` : 'border'
              }`}
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
                          className={`pachisi-token pachisi-token-seat-${seat} pointer-events-auto z-30 aspect-square w-[62%] animate-bounce cursor-pointer rounded-full border shadow-md ring-2 ring-white/90 transition-transform hover:scale-110 ${BOARD_CELL_FOCUS_CLASS}`}
                          data-testid={`yard-token-${seat}-${slot}`}
                          onClick={() => onMove(tok.id)}
                          type="button"
                        />
                      );
                    }
                    return (
                      <span
                        key={`yard-slot-${seat}-${slot}`}
                        className={`aspect-square w-[62%] rounded-full border shadow-md ${
                          tok
                            ? `pachisi-token pachisi-token-seat-${seat} opacity-100`
                            : 'pachisi-cell border-dashed opacity-30'
                        }`}
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
          return (
            <div
              key={`track-${idx}`}
              className={`pachisi-row-${row + 1} pachisi-col-${col + 1} relative m-[4%] flex items-center justify-center rounded-md border ${cellClass}`}
              data-testid={`cell-${idx}`}
            >
              {isStar && (
                <span className="pachisi-cell-star pointer-events-none absolute inset-0 flex items-center justify-center text-[9px] font-bold">
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
                      className={`pointer-events-auto z-30 cursor-pointer absolute inset-0 flex animate-bounce items-center justify-center rounded-md ${BOARD_CELL_FOCUS_CLASS}`}
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
                        className={`pachisi-token pachisi-token-seat-${seat} block h-[72%] w-[72%] rounded-full border shadow-md`}
                      />
                    </div>
                  ))}
              </div>
            );
          }),
        )}

        <div className="pachisi-center-home pachisi-center-home-area relative z-10 m-[6%] flex items-center justify-center rounded-lg border shadow-inner">
          <div className="grid grid-cols-2 place-items-center gap-x-2 gap-y-0.5 px-1">
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
      </div>
    </div>
  );
}
