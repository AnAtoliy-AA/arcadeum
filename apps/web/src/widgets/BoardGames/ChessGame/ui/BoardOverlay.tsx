'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { BoardPosition, File, Rank } from '../types';
import {
  resolveDrawingColor,
  type Arrow,
  type DrawingCircle,
} from '../hooks/useBoardDrawings';
import type { PremoveStep } from '../hooks/usePremoveQueue';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface BoardOverlayProps {
  arrows: Arrow[];
  circles: DrawingCircle[];
  isFlipped?: boolean;
  premoveQueue?: PremoveStep[];
  bestMoveArrow?: Arrow | null;
  threatArrows?: Arrow[];
  showBestMove?: boolean;
  showThreats?: boolean;
  children: React.ReactNode;
  onAddArrow: (from: BoardPosition, to: BoardPosition, color?: string) => void;
  onToggleCircle: (square: BoardPosition, color?: string) => void;
  onClear: () => void;
  onCancelPremoves?: () => void;
}

const FILES: File[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8];

function squareToPixel(
  pos: BoardPosition,
  boardRect: DOMRect,
  isFlipped: boolean,
): { x: number; y: number } {
  const fileIdx = FILES.indexOf(pos.file);
  const rankIdx = RANKS.indexOf(pos.rank);
  const col = isFlipped ? 7 - fileIdx : fileIdx;
  const row = isFlipped ? rankIdx : 7 - rankIdx;
  const cellW = boardRect.width / 8;
  const cellH = boardRect.height / 8;
  return {
    x: col * cellW + cellW / 2,
    y: row * cellH + cellH / 2,
  };
}

function pixelToSquare(
  x: number,
  y: number,
  boardRect: DOMRect,
  isFlipped: boolean,
): BoardPosition | null {
  const cellW = boardRect.width / 8;
  const cellH = boardRect.height / 8;
  const col = Math.floor(x / cellW);
  const row = Math.floor(y / cellH);
  if (col < 0 || col > 7 || row < 0 || row > 7) return null;
  const fileIdx = isFlipped ? 7 - col : col;
  const rankIdx = isFlipped ? row : 7 - row;
  return { file: FILES[fileIdx], rank: RANKS[rankIdx] };
}

function ArrowSvg({
  from,
  to,
  color,
  boardRect,
  isFlipped,
  dashed = false,
  badgeText,
}: {
  from: BoardPosition;
  to: BoardPosition;
  color: string;
  boardRect: DOMRect;
  isFlipped: boolean;
  dashed?: boolean;
  badgeText?: string;
}) {
  const p1 = squareToPixel(from, boardRect, isFlipped);
  const p2 = squareToPixel(to, boardRect, isFlipped);
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const headLen = Math.max(14, boardRect.width * 0.04);
  const headWidth = Math.max(12, boardRect.width * 0.035);
  const endX = p2.x - headLen * 0.6 * Math.cos(angle);
  const endY = p2.y - headLen * 0.6 * Math.sin(angle);
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;

  return (
    <g>
      <line
        x1={p1.x}
        y1={p1.y}
        x2={endX}
        y2={endY}
        stroke={color}
        strokeWidth={Math.max(6, boardRect.width * 0.016)}
        strokeLinecap="round"
        strokeDasharray={dashed ? '6 4' : undefined}
      />
      <polygon
        points={`
          ${p2.x},${p2.y}
          ${p2.x - headLen * Math.cos(angle) + headWidth * Math.sin(angle)},${p2.y - headLen * Math.sin(angle) - headWidth * Math.cos(angle)}
          ${p2.x - headLen * 0.6 * Math.cos(angle)},${p2.y - headLen * 0.6 * Math.sin(angle)}
          ${p2.x - headLen * Math.cos(angle) - headWidth * Math.sin(angle)},${p2.y - headLen * Math.sin(angle) + headWidth * Math.cos(angle)}
        `}
        fill={color}
      />
      {badgeText && (
        <g>
          <circle
            cx={midX}
            cy={midY}
            r={10}
            fill="#09090b"
            stroke={color}
            strokeWidth={2}
          />
          <text
            x={midX}
            y={midY + 3.5}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {badgeText}
          </text>
        </g>
      )}
    </g>
  );
}

export function BoardOverlay({
  arrows,
  circles,
  isFlipped = false,
  premoveQueue = [],
  bestMoveArrow,
  threatArrows = [],
  showBestMove = false,
  showThreats = false,
  children,
  onAddArrow,
  onToggleCircle,
  onClear,
  onCancelPremoves,
}: BoardOverlayProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [isRightDragging, setIsRightDragging] = useState(false);
  const [dragStart, setDragStart] = useState<BoardPosition | null>(null);
  const [dragEnd, setDragEnd] = useState<BoardPosition | null>(null);
  const [dragColor, setDragColor] = useState<string>('rgba(34, 197, 94, 0.8)');
  const [boardRect, setBoardRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const update = () => {
      setBoardRect(board.getBoundingClientRect());
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(board);
    return () => observer.disconnect();
  }, []);

  const getSquareFromMouseEvent = useCallback(
    (e: React.MouseEvent) => {
      if (!boardRef.current || !boardRect) return null;
      const rect = boardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      return pixelToSquare(x, y, boardRect, isFlipped);
    },
    [boardRect, isFlipped],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        const sq = getSquareFromMouseEvent(e);
        if (sq) {
          setIsRightDragging(true);
          setDragStart(sq);
          setDragEnd(sq);
          setDragColor(resolveDrawingColor(e));
        }
      } else if (e.button === 0) {
        if (arrows.length > 0 || circles.length > 0) {
          onClear();
        }
      }
    },
    [getSquareFromMouseEvent, arrows.length, circles.length, onClear],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isRightDragging) return;
      const sq = getSquareFromMouseEvent(e);
      if (sq && (sq.file !== dragEnd?.file || sq.rank !== dragEnd?.rank)) {
        setDragEnd(sq);
      }
    },
    [isRightDragging, getSquareFromMouseEvent, dragEnd],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 2 && isRightDragging && dragStart && dragEnd) {
        if (
          dragStart.file === dragEnd.file &&
          dragStart.rank === dragEnd.rank
        ) {
          onToggleCircle(dragStart, dragColor);
        } else {
          onAddArrow(dragStart, dragEnd, dragColor);
        }
        if (premoveQueue.length > 0 && onCancelPremoves) {
          onCancelPremoves();
        }
      }
      setIsRightDragging(false);
      setDragStart(null);
      setDragEnd(null);
    },
    [
      isRightDragging,
      dragStart,
      dragEnd,
      dragColor,
      onToggleCircle,
      onAddArrow,
      premoveQueue.length,
      onCancelPremoves,
    ],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClear();
        onCancelPremoves?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClear, onCancelPremoves]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      <div ref={boardRef} className="relative w-full h-full">
        {children}
      </div>

      {(arrows.length > 0 || circles.length > 0) && (
        <div className="absolute top-2 right-2 z-30 hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md shadow-lg pointer-events-auto">
          <button
            type="button"
            onClick={onClear}
            title={t('games.chess_v1.board.clearDrawingsHint')}
            className="px-2 py-1 rounded-lg text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-transparent"
          >
            {t('games.chess_v1.board.clearDrawings')}
          </button>
        </div>
      )}

      {boardRect && (
        <svg
          className="pointer-events-none absolute inset-0 z-20 w-full h-full"
          width={boardRect.width}
          height={boardRect.height}
          viewBox={`0 0 ${boardRect.width} ${boardRect.height}`}
        >
          {showThreats &&
            threatArrows.map((arrow, i) => (
              <ArrowSvg
                key={`threat-${i}`}
                from={arrow.from}
                to={arrow.to}
                color="rgba(239, 68, 68, 0.75)"
                boardRect={boardRect}
                isFlipped={isFlipped}
                dashed={true}
              />
            ))}

          {showBestMove && bestMoveArrow && (
            <ArrowSvg
              from={bestMoveArrow.from}
              to={bestMoveArrow.to}
              color="rgba(6, 182, 212, 0.9)"
              boardRect={boardRect}
              isFlipped={isFlipped}
            />
          )}

          {premoveQueue.map((step, i) => (
            <ArrowSvg
              key={`premove-${i}`}
              from={step.from}
              to={step.to}
              color="rgba(245, 158, 11, 0.85)"
              boardRect={boardRect}
              isFlipped={isFlipped}
              dashed={true}
              badgeText={String(i + 1)}
            />
          ))}

          {arrows.map((arrow, i) => (
            <ArrowSvg
              key={`arrow-${i}`}
              from={arrow.from}
              to={arrow.to}
              color={arrow.color}
              boardRect={boardRect}
              isFlipped={isFlipped}
            />
          ))}

          {circles.map((circle, i) => {
            const pos = squareToPixel(circle.square, boardRect, isFlipped);
            const cellW = boardRect.width / 8;
            return (
              <circle
                key={`circle-${i}`}
                cx={pos.x}
                cy={pos.y}
                r={cellW * 0.38}
                fill="none"
                stroke={circle.color}
                strokeWidth={Math.max(4, boardRect.width * 0.01)}
              />
            );
          })}

          {isRightDragging && dragStart && dragEnd && (
            <ArrowSvg
              from={dragStart}
              to={dragEnd}
              color={dragColor}
              boardRect={boardRect}
              isFlipped={isFlipped}
              dashed={true}
            />
          )}
        </svg>
      )}
    </div>
  );
}
