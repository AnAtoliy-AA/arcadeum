'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
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
  destinationOf,
  isSafeCellFor,
  movableTokenIds,
} from '../lib/boardLayout';
import { detectCaptures } from '../lib/pachisiEvents';
import { controlledOwnerId, partnerOf, teamOfPlayer } from '../lib/teams';
import type { PachisiClientState, PachisiToken } from '../types';
import { FINISH_PROGRESS, MAIN_PATH_STEPS } from '../types';
import { PachisiStatusStrip } from './PachisiStatusStrip';
import { PachisiLegend } from './PachisiLegend';
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
  /** `ownerId` is set only when moving the partner's token (team mode). */
  onMove: (tokenId: number, ownerId?: string) => void;
  onPassTurn?: () => void;
  highlightedCells?: { row: number; col: number }[];
}

interface CaptureFx {
  cells: Set<number>;
  /** `ownerId:tokenId` keys of tokens just sent home. */
  tokens: string[];
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

function sentHomeIdsFor(
  capture: CaptureFx | null,
  ownerId: string | null,
): ReadonlySet<number> | undefined {
  if (!capture || !ownerId) return undefined;
  const ids = capture.tokens
    .filter((k) => k.startsWith(`${ownerId}:`))
    .map((k) => Number(k.slice(ownerId.length + 1)));
  return ids.length > 0 ? new Set(ids) : undefined;
}

export function PachisiBoard({
  snapshot,
  currentUserId,
  myTurn,
  actionBusy = false,
  onRoll,
  onMove: onMoveToken,
  onPassTurn,
  highlightedCells = [],
}: PachisiBoardProps) {
  const { t } = useTranslation();
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
  const prevTokens = useRef<Record<string, PachisiToken[]> | null>(null);
  const captureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [capture, setCapture] = useState<CaptureFx | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);

  useEffect(
    () => () => {
      if (captureTimer.current) clearTimeout(captureTimer.current);
    },
    [],
  );

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

    const captures = detectCaptures(
      prevTokens.current,
      snapshot.tokens,
      snapshot.seats,
    );
    prevTokens.current = snapshot.tokens;
    if (captures.length > 0) {
      setCapture({
        cells: new Set(
          captures.flatMap((c) => (c.cell === null ? [] : [c.cell])),
        ),
        tokens: captures.map((c) => `${c.ownerId}:${c.tokenId}`),
      });
      if (captureTimer.current) clearTimeout(captureTimer.current);
      captureTimer.current = setTimeout(() => setCapture(null), 900);
    }
  }, [snapshot, snapshot.playerOrder, snapshot.seats, snapshot.tokens]);

  // Team mode: once all own tokens are home the viewer moves the partner's.
  const partnerId = partnerOf(snapshot, currentUserId);
  const controlledId = controlledOwnerId(snapshot, currentUserId);
  const movingPartner = controlledId !== null && controlledId !== currentUserId;

  const movable = useMemo(
    () =>
      canMove && controlledId
        ? movableTokenIds(snapshot.tokens[controlledId], snapshot.die)
        : new Set<number>(),
    [canMove, controlledId, snapshot.die, snapshot.tokens],
  );

  const onMove = useCallback(
    (tokenId: number) => {
      if (movingPartner && controlledId) onMoveToken(tokenId, controlledId);
      else onMoveToken(tokenId);
    },
    [onMoveToken, movingPartner, controlledId],
  );

  const boardRef = useRef<HTMLDivElement>(null);
  usePachisiKeyboardTurn({
    boardRef,
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
        list.push({
          ownerId: playerId,
          seat,
          token,
          isPartner: playerId === partnerId,
        });
        map.set(cell, list);
      }
    }
    return map;
  }, [snapshot.playerOrder, snapshot.seats, snapshot.tokens, partnerId]);

  // Destination hints for movable tokens (hover/focus narrows to one token).
  const hints = useMemo(() => {
    const track = new Map<number, { active: boolean; capture: boolean }>();
    const lane = new Map<string, boolean>();
    if (!controlledId || movable.size === 0) return { track, lane };
    const seat = snapshot.seats[controlledId];
    if (seat === undefined) return { track, lane };
    const myTeam = teamOfPlayer(snapshot, controlledId);
    for (const token of snapshot.tokens[controlledId] ?? []) {
      if (!movable.has(token.id)) continue;
      const dest = destinationOf(seat, token, snapshot.die);
      if (!dest) continue;
      const active = previewId === null || previewId === token.id;
      if (dest.kind === 'track') {
        const capture =
          !isSafeCellFor(dest.cell, seat) &&
          (trackTokens.get(dest.cell) ?? []).some(
            (o) =>
              o.ownerId !== controlledId &&
              (myTeam === null || teamOfPlayer(snapshot, o.ownerId) !== myTeam),
          );
        const prev = track.get(dest.cell);
        track.set(dest.cell, {
          active: (prev?.active ?? false) || previewId === token.id,
          capture: (prev?.capture ?? false) || (capture && active),
        });
      } else if (dest.kind === 'lane') {
        const key = `${dest.seat}-${dest.laneIdx}`;
        lane.set(key, (lane.get(key) ?? false) || previewId === token.id);
      }
    }
    return { track, lane };
  }, [controlledId, movable, previewId, snapshot, trackTokens]);

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
      className="box-border flex w-full flex-col items-center gap-2 select-none sm:gap-3 landscape:lg:flex-row landscape:lg:items-start landscape:lg:justify-center"
      style={boardVars(theme)}
    >
      <div className="flex w-full min-w-0 flex-col items-center gap-2 landscape:lg:w-[min(300px,28%)] landscape:lg:shrink-0">
        <PachisiStatusStrip
          actionBusy={actionBusy}
          canMove={canMove}
          canRoll={canRoll}
          currentUserId={currentUserId}
          movingPartner={movingPartner}
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
      </div>

      <div className="flex w-full min-w-0 flex-col items-center gap-2 landscape:lg:flex-1">
        <div
          ref={boardRef}
          role="group"
          aria-label={t('games.pachisi_v1.game.boardAria')}
          className={`pachisi-board pachisi-board-rot-${boardRotation} relative aspect-square w-full ${isFullscreen ? 'max-h-[calc(100dvh-160px)] max-w-[calc(100dvh-160px)] landscape:lg:max-h-[calc(100dvh-70px)] landscape:lg:max-w-[calc(100dvh-70px)]' : 'max-h-[calc(100dvh-200px)] max-w-[calc(100dvh-200px)] landscape:lg:max-h-[calc(100dvh-110px)] landscape:lg:max-w-[calc(100dvh-110px)]'} overflow-hidden rounded-2xl border-2 md:backdrop-blur-xl shrink-0 mx-auto`}
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
                currentUserId={controlledId}
                isActive={seat === activeSeat}
                team={owner ? teamOfPlayer(snapshot, owner) : null}
                isSelf={owner != null && owner === currentUserId}
                isPartner={owner != null && owner === partnerId}
                tokens={ownerTokens}
                movable={movable}
                onMove={onMove}
                die={snapshot.die}
                onPreview={setPreviewId}
                sentHomeIds={sentHomeIdsFor(capture, owner)}
              />
            );
          })}

          {TRACK_COORDS.map(([row, col], idx) => {
            const isStar = STAR_CELLS.has(idx);
            const startSeat = SEAT_START_OFFSETS.findIndex(
              (off) => off === idx,
            );
            const occupants = trackTokens.get(idx) ?? [];
            const cellClass =
              startSeat >= 0
                ? `pachisi-cell-seat-${startSeat}`
                : 'pachisi-cell';
            const isHighlight =
              lastMove?.fromCell === idx || lastMove?.toCell === idx;
            const highlightClass = isHighlight
              ? 'pachisi-cell-highlight'
              : highlightedTrackCells.has(idx)
                ? 'pachisi-cell-chat-highlight'
                : '';
            const hint = hints.track.get(idx);
            const hintClass = hint
              ? hint.capture
                ? 'pachisi-cell-dest-capture'
                : hint.active
                  ? 'pachisi-cell-dest-active'
                  : 'pachisi-cell-dest'
              : '';
            const flashClass = capture?.cells.has(idx)
              ? 'pachisi-capture-flash'
              : '';
            return (
              <div
                key={`track-${idx}`}
                className={`pachisi-row-${row + 1} pachisi-col-${col + 1} relative m-[4%] flex items-center justify-center rounded-md border ${cellClass} ${highlightClass} ${hintClass} ${flashClass}`}
                data-testid={`cell-${idx}`}
                data-dest={
                  hint ? (hint.capture ? 'capture' : 'move') : undefined
                }
              >
                {isStar && (
                  <span className="pachisi-cell-star pointer-events-none absolute inset-0 flex items-center justify-center text-[9px] font-bold drop-shadow-sm">
                    ★
                  </span>
                )}
                {occupants.length > 0 && (
                  <PachisiTokenStack
                    cellKey={`${idx}`}
                    currentUserId={controlledId}
                    canMove={canMove}
                    movable={movable}
                    onMove={onMove}
                    tokens={occupants}
                    isLandingCell={lastMove?.toCell === idx}
                    die={snapshot.die}
                    onPreview={setPreviewId}
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
                    .map((token) => ({
                      ownerId: owner,
                      seat,
                      token,
                      isPartner: owner === partnerId,
                    }))
                : [];
              return (
                <div
                  key={`lane-${seat}-${laneIdx}`}
                  className={`pachisi-lane-seat-${seat} pachisi-row-${row + 1} pachisi-col-${col + 1} relative m-[10%] rounded-md border ${
                    hints.lane.has(`${seat}-${laneIdx}`)
                      ? hints.lane.get(`${seat}-${laneIdx}`)
                        ? 'pachisi-cell-dest-active'
                        : 'pachisi-cell-dest'
                      : ''
                  }`}
                  data-testid={`lane-cell-${seat}-${laneIdx}`}
                >
                  {occupants.length > 0 && (
                    <PachisiTokenStack
                      cellKey={`lane-token-${seat}-${laneIdx}`}
                      currentUserId={controlledId}
                      canMove={canMove}
                      movable={movable}
                      onMove={onMove}
                      tokens={occupants}
                      die={snapshot.die}
                      onPreview={setPreviewId}
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
            celebrate={snapshot.die === 6 || isExtraRoll}
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
        <PachisiLegend />
      </div>
    </div>
  );
}
