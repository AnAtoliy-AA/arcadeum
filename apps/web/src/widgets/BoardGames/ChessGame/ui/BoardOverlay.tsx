'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { BoardPosition, File, Rank } from '../types';
import type { Arrow, DrawingCircle } from '../hooks/useBoardDrawings';

interface BoardOverlayProps {
  arrows: Arrow[];
  circles: DrawingCircle[];
  children: React.ReactNode;
  onAddArrow: (from: BoardPosition, to: BoardPosition) => void;
  onAddCircle: (square: BoardPosition) => void;
  onClear: () => void;
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

function ArrowHead({
  from,
  to,
  color,
  boardRect,
  isFlipped,
}: {
  from: BoardPosition;
  to: BoardPosition;
  color: string;
  boardRect: DOMRect;
  isFlipped: boolean;
}) {
  const p1 = squareToPixel(from, boardRect, isFlipped);
  const p2 = squareToPixel(to, boardRect, isFlipped);
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const headLen = 12;

  return (
    <polygon
      points={`
        ${p2.x},${p2.y}
        ${p2.x - headLen * Math.cos(angle - Math.PI / 6)},${p2.y - headLen * Math.sin(angle - Math.PI / 6)}
        ${p2.x - headLen * Math.cos(angle + Math.PI / 6)},${p2.y - headLen * Math.sin(angle + Math.PI / 6)}
      `}
      fill={color}
    />
  );
}

export function BoardOverlay({
  arrows,
  circles,
  children,
  onAddArrow,
  onAddCircle,
  onClear,
}: BoardOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<BoardPosition | null>(null);
  const [dragEnd, setDragEnd] = useState<BoardPosition | null>(null);
  const [boardRect, setBoardRect] = useState<DOMRect | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const observer = new ResizeObserver(() => {
      setBoardRect(board.getBoundingClientRect());
    });
    observer.observe(board);
    return () => observer.disconnect();
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!boardRect) return;

      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const square = pixelToSquare(x, y, boardRect, isFlipped);
      if (!square) return;

      if (e.shiftKey) {
        onAddCircle(square);
      } else {
        if (!isDragging) {
          setIsDragging(true);
          setDragStart(square);
          setDragEnd(square);
        } else {
          if (dragStart) {
            onAddArrow(dragStart, square);
          }
          setIsDragging(false);
          setDragStart(null);
          setDragEnd(null);
        }
      }
    },
    [boardRect, isDragging, dragStart, onAddArrow, onAddCircle, isFlipped],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !boardRect) return;
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const square = pixelToSquare(x, y, boardRect, isFlipped);
      if (square) setDragEnd(square);
    },
    [isDragging, boardRect, isFlipped],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
    }
  }, [isDragging]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.detail === 2) {
        onClear();
      }
    },
    [onClear],
  );

  return (
    <div
      ref={containerRef}
      className="relative"
      onContextMenu={handleContextMenu}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      <div ref={boardRef} className="relative">
        {children}
      </div>

      {boardRect && (
        <svg
          className="pointer-events-none absolute inset-0 z-10"
          width={boardRect.width}
          height={boardRect.height}
          viewBox={`0 0 ${boardRect.width} ${boardRect.height}`}
        >
          {arrows.map((arrow, i) => (
            <g key={`arrow-${i}`}>
              <line
                x1={squareToPixel(arrow.from, boardRect, isFlipped).x}
                y1={squareToPixel(arrow.from, boardRect, isFlipped).y}
                x2={squareToPixel(arrow.to, boardRect, isFlipped).x}
                y2={squareToPixel(arrow.to, boardRect, isFlipped).y}
                stroke={arrow.color}
                strokeWidth={6}
                strokeLinecap="round"
              />
              <ArrowHead
                from={arrow.from}
                to={arrow.to}
                color={arrow.color}
                boardRect={boardRect}
                isFlipped={isFlipped}
              />
            </g>
          ))}

          {circles.map((circle, i) => {
            const pos = squareToPixel(circle.square, boardRect, isFlipped);
            const cellW = boardRect.width / 8;
            return (
              <circle
                key={`circle-${i}`}
                cx={pos.x}
                cy={pos.y}
                r={cellW * 0.35}
                fill="none"
                stroke={circle.color}
                strokeWidth={4}
              />
            );
          })}

          {isDragging && dragStart && dragEnd && (
            <g>
              <line
                x1={squareToPixel(dragStart, boardRect, isFlipped).x}
                y1={squareToPixel(dragStart, boardRect, isFlipped).y}
                x2={squareToPixel(dragEnd, boardRect, isFlipped).x}
                y2={squareToPixel(dragEnd, boardRect, isFlipped).y}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray="8 4"
              />
            </g>
          )}
        </svg>
      )}
    </div>
  );
}
