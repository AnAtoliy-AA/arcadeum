'use client';

import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { BOARD_CELL_FOCUS_CLASS } from '@/shared/lib/keyboard-navigation';
import { usePachisiTheme } from '../lib/PachisiThemeContext';
import {
  LANE_COORDS,
  SEAT_START_OFFSETS,
  STAR_CELLS,
  TRACK_COORDS,
  YARD_AREAS,
  absoluteCell,
  movableTokenIds,
} from '../lib/boardLayout';
import type { PachisiClientState, PachisiToken } from '../types';
import { FINISH_PROGRESS, MAIN_PATH_STEPS, YARD_PROGRESS } from '../types';
import { Die } from './Die';

const GRID_SIZE = 15;

interface PachisiBoardProps {
  snapshot: PachisiClientState;
  currentUserId: string | null;
  myTurn: boolean;
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
  onRoll,
  onMove,
  onPassTurn,
}: PachisiBoardProps) {
  const { t } = useTranslation();
  const theme = usePachisiTheme();

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

  /** Main-track occupancy: absCell -> tokens there. */
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

  /** Tokens waiting in each seat's yard. */
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

  /** One token on a board cell; interactive when it is mine and movable. */
  const renderPlacedToken = (
    placed: PlacedToken,
    i: number,
    stackSize: number,
    cellKey: string,
  ) => {
    const movableToken = isMovableToken(placed);
    const style: CSSProperties = {
      width: '72%',
      height: '72%',
      background: theme.seatColors[placed.seat],
      borderColor: theme.tokenBorder,
      transform: `translate(${(i - (stackSize - 1) / 2) * 18}%, ${
        i % 2 === 0 ? -8 : 8
      }%) scale(${1 - i * 0.08})`,
      zIndex: i,
      pointerEvents: movableToken ? 'auto' : 'none',
    };
    const shared = {
      'data-testid': `token-cell-${cellKey}-${placed.token.id}`,
    };
    if (movableToken) {
      return (
        <button
          key={`${placed.ownerId}-${placed.token.id}`}
          aria-label={t('games.pachisi_v1.game.moveTokenAria', {
            id: placed.token.id,
          })}
          className={`absolute animate-bounce rounded-full border-2 shadow-md ring-2 ring-white/90 transition-transform hover:scale-110 ${BOARD_CELL_FOCUS_CLASS}`}
          onClick={() => onMove(placed.token.id)}
          style={style}
          type="button"
          {...shared}
        />
      );
    }
    return (
      <span
        key={`${placed.ownerId}-${placed.token.id}`}
        className="absolute rounded-full border shadow-md"
        style={style}
        {...shared}
      />
    );
  };

  const renderTokenStack = (tokens: PlacedToken[], cellKey: string) => (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative flex items-center justify-center">
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
    <div className="box-border flex w-full flex-col items-stretch gap-2 select-none">
      {/* Status strip */}
      <div className="flex flex-row flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          {snapshot.playerOrder.map((pid) => {
            const seat = seatOf(pid);
            const finished = finishedCounts.get(pid) ?? 0;
            const total = snapshot.tokens[pid]?.length ?? 4;
            const isMe = pid === currentUserId;
            return (
              <span
                key={`score-${pid}`}
                className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                  isMe ? 'ring-1 ring-white/60' : ''
                }`}
                style={{ background: `${theme.seatColors[seat]}33` }}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border"
                  style={{
                    background: theme.seatColors[seat],
                    borderColor: theme.tokenBorder,
                  }}
                />
                🏠 {finished}/{total}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {canRoll ? (
            <button
              aria-label={t('games.pachisi_v1.game.rollDice')}
              className="rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 px-3 py-1 text-[12px] font-black uppercase tracking-wide text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              data-testid="pachisi-roll-button"
              onClick={onRoll}
              type="button"
            >
              🎲 {t('games.pachisi_v1.game.rollDice')}
            </button>
          ) : (
            <Die value={snapshot.die} />
          )}
        </div>
      </div>

      {/* Status hint */}
      {canRoll && (
        <div
          className="text-center text-[12px] font-bold text-emerald-300"
          data-testid="pachisi-roll-hint"
        >
          {t('games.pachisi_v1.game.yourTurnToRoll')}
        </div>
      )}
      {canMove && movable.size > 0 && (
        <div
          className="text-center text-[12px] font-bold text-emerald-300"
          data-testid="pachisi-move-hint"
        >
          {t('games.pachisi_v1.game.yourTurnToMove')}
          <span className="mt-0.5 block text-[11px] text-emerald-200/80">
            {t('games.pachisi_v1.game.tapToken')}
          </span>
        </div>
      )}
      {canMove && movable.size === 0 && (
        <div
          className="flex flex-col items-center gap-1.5"
          data-testid="pachisi-no-moves"
        >
          <div className="text-center text-[12px] font-bold text-amber-300">
            {t('games.pachisi_v1.game.noLegalMoves')}
          </div>
          {onPassTurn && (
            <button
              aria-label={t('games.pachisi_v1.game.passTurn')}
              className="rounded-lg border border-amber-500/40 bg-amber-950/50 px-3 py-1 text-[11px] font-semibold text-amber-300 transition-colors hover:bg-amber-900/60 active:scale-95"
              data-testid="pachisi-pass-button"
              onClick={onPassTurn}
              type="button"
            >
              {t('games.pachisi_v1.game.passTurn')}
            </button>
          )}
        </div>
      )}
      {!myTurn && !isGameOver && (
        <div
          className="text-center text-[12px] font-semibold text-white/50"
          data-testid="pachisi-waiting"
        >
          {snapshot.phase === 'roll'
            ? t('games.pachisi_v1.game.waitingForOpponentRoll')
            : t('games.pachisi_v1.game.waitingForOpponentMove')}
        </div>
      )}

      {/* Board */}
      <div
        className="box-border relative w-full overflow-hidden rounded-2xl border-2 shadow-2xl backdrop-blur-xl"
        data-testid="pachisi-board"
        style={{
          aspectRatio: '1 / 1',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          background: theme.boardBackground,
          borderColor: theme.yardBorder,
        }}
      >
        {/* Yards */}
        {[0, 1, 2, 3].map((seat) => {
          const area = YARD_AREAS[seat];
          const owner = playerAtSeat(seat);
          const yard = yardTokens.get(seat) ?? [];
          const slotCount =
            owner != null ? (snapshot.tokens[owner]?.length ?? 4) : 4;
          const isMine = owner != null && owner === currentUserId;
          return (
            <div
              key={`yard-${seat}`}
              className="flex items-center justify-center rounded-xl border p-[8%]"
              style={{
                gridRow: `${area.row} / span 6`,
                gridColumn: `${area.col} / span 6`,
                margin: '5%',
                background: theme.yardBackground,
                borderColor:
                  owner != null ? theme.seatColors[seat] : theme.yardBorder,
                borderWidth: owner != null ? 2 : 1,
              }}
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
                          className={`aspect-square w-[62%] animate-bounce cursor-pointer rounded-full border shadow-md ring-2 ring-white/90 transition-transform hover:scale-110 ${BOARD_CELL_FOCUS_CLASS}`}
                          data-testid={`yard-token-${seat}-${slot}`}
                          onClick={() => onMove(tok.id)}
                          style={{
                            background: theme.seatColors[seat],
                            borderColor: theme.tokenBorder,
                          }}
                          type="button"
                        />
                      );
                    }
                    return (
                      <span
                        key={`yard-slot-${seat}-${slot}`}
                        className="aspect-square w-[62%] rounded-full border shadow-md"
                        data-testid={`yard-token-${seat}-${slot}`}
                        style={{
                          background: tok
                            ? theme.seatColors[seat]
                            : 'transparent',
                          borderColor: tok
                            ? theme.tokenBorder
                            : theme.cellBorder,
                          opacity: tok ? 1 : 0.35,
                        }}
                      />
                    );
                  },
                )}
              </div>
            </div>
          );
        })}

        {/* Main-track cells */}
        {TRACK_COORDS.map(([row, col], idx) => {
          const isStar = STAR_CELLS.has(idx);
          const startSeat = SEAT_START_OFFSETS.findIndex((off) => off === idx);
          const occupants = trackTokens.get(idx) ?? [];
          const bg =
            startSeat >= 0
              ? `${theme.seatColors[startSeat]}66`
              : theme.cellBackground;
          return (
            <div
              key={`track-${idx}`}
              className="relative flex items-center justify-center rounded-md border"
              data-testid={`cell-${idx}`}
              style={{
                gridRow: row + 1,
                gridColumn: col + 1,
                margin: '4%',
                background: bg,
                borderColor: theme.cellBorder,
              }}
            >
              {isStar && (
                <span
                  className="pointer-events-none absolute inset-0 flex items-center justify-center text-[9px]"
                  style={{ color: theme.safeStar }}
                >
                  ★
                </span>
              )}
              {occupants.length > 0 && renderTokenStack(occupants, `${idx}`)}
            </div>
          );
        })}

        {/* Home lanes */}
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
                className="relative rounded-md border"
                data-testid={`lane-cell-${seat}-${laneIdx}`}
                style={{
                  gridRow: row + 1,
                  gridColumn: col + 1,
                  margin: '10%',
                  background: `${theme.seatColors[seat]}55`,
                  borderColor: theme.cellBorder,
                }}
              >
                {occupant &&
                  (movableOccupant ? (
                    <button
                      aria-label={t('games.pachisi_v1.game.moveTokenAria', {
                        id: occupant.id,
                      })}
                      className={`absolute inset-0 flex animate-bounce items-center justify-center rounded-md ${BOARD_CELL_FOCUS_CLASS}`}
                      data-testid={`lane-token-${seat}-${laneIdx}`}
                      onClick={() => onMove(occupant.id)}
                      type="button"
                    >
                      <span
                        className="block h-[72%] w-[72%] rounded-full border-2 shadow-md ring-2 ring-white/90 transition-transform hover:scale-110"
                        style={{
                          background: theme.seatColors[seat],
                          borderColor: theme.tokenBorder,
                        }}
                      />
                    </button>
                  ) : (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span
                        className="block h-[72%] w-[72%] rounded-full border shadow-md"
                        style={{
                          background: theme.seatColors[seat],
                          borderColor: theme.tokenBorder,
                        }}
                      />
                    </div>
                  ))}
              </div>
            );
          }),
        )}

        {/* Center home */}
        <div
          className="relative z-10 flex items-center justify-center rounded-lg border shadow-inner"
          style={{
            gridRow: '7 / span 3',
            gridColumn: '7 / span 3',
            margin: '6%',
            background: theme.centerHome,
            borderColor: theme.cellBorder,
          }}
        >
          <div className="grid grid-cols-2 place-items-center gap-x-2 gap-y-0.5 px-1">
            {snapshot.playerOrder.map((pid) => {
              const seat = seatOf(pid);
              const finished = finishedCounts.get(pid) ?? 0;
              return (
                <span
                  key={`home-count-${pid}`}
                  className="flex items-center gap-0.5 rounded-full px-1 text-[10px] font-black text-white"
                  style={{ background: `${theme.seatColors[seat]}cc` }}
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
