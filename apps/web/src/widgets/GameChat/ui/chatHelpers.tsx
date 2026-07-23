import type { ReactNode } from 'react';

const RESULT_COLORS: Record<string, string> = {
  HIT: '#F97316',
  MISS: '#94A3B8',
  SUNK: '#EF4444',
};

const RESULT_PATTERN = /\b(HIT|MISS|SUNK)\b/;

const MOVE_PATTERN = /Mark placed at \((-?\d+), (-?\d+)\)/;

export function parseMoveCell(
  message: string,
): { row: number; col: number } | null {
  const m = MOVE_PATTERN.exec(message);
  if (!m) return null;
  return { row: Number(m[1]), col: Number(m[2]) };
}

export function renderResultHighlights(message: string): ReactNode {
  const match = RESULT_PATTERN.exec(message);
  if (!match) return message;
  const idx = match.index;
  const keyword = match[0];
  const color = RESULT_COLORS[keyword];
  return (
    <>
      {message.slice(0, idx)}
      <span style={{ color, fontWeight: 800 }}>{keyword}</span>
      {message.slice(idx + keyword.length)}
    </>
  );
}
