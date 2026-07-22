'use client';

import { useState, useCallback } from 'react';
import type { ChessClientState } from '../types';
import { generateMoveList, generatePGN } from '../lib/pgn';

interface MoveListProps {
  state: ChessClientState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: any, params?: Record<string, string | number>) => string;
  onMoveHover?: (moveIndex: number | null) => void;
}

export function MoveList({ state, t: _t, onMoveHover }: MoveListProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hoveredMove, setHoveredMove] = useState<number | null>(null);
  const moves = generateMoveList(state);

  const pairs: {
    white: string;
    black: string;
    num: number;
    whiteIdx: number;
    blackIdx: number;
  }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i] ?? '',
      black: moves[i + 1] ?? '',
      whiteIdx: i,
      blackIdx: i + 1,
    });
  }

  const visiblePairs = expanded ? pairs : pairs.slice(-8);

  const handleCopyPGN = useCallback(() => {
    const pgn = generatePGN(state);
    navigator.clipboard.writeText(pgn).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [state]);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: 'rgba(148, 163, 184, 0.5)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          MOVES
        </span>
        <div style={{ display: 'flex', gap: 12 }}>
          {pairs.length > 8 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              style={{
                fontSize: 11,
                color: 'rgba(148, 163, 184, 0.5)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {expanded ? 'Show less' : `Show all (${pairs.length})`}
            </button>
          )}
          <button
            type="button"
            onClick={handleCopyPGN}
            style={{
              fontSize: 11,
              color: copied ? '#22c55e' : 'rgba(148, 163, 184, 0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {copied ? 'Copied!' : 'Copy PGN'}
          </button>
        </div>
      </div>
      <div
        style={{
          maxHeight: 240,
          overflowY: 'auto',
          padding: '8px 12px',
          borderRadius: 10,
          backgroundColor: 'rgba(15, 20, 30, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          minHeight: 60,
        }}
      >
        {pairs.length === 0 && (
          <div
            style={{
              fontSize: 12,
              color: 'rgba(148, 163, 184, 0.4)',
              textAlign: 'center',
              padding: '16px 0',
            }}
          >
            No moves yet
          </div>
        )}
        {visiblePairs.map((pair) => (
          <div
            key={pair.num}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
            }}
          >
            <span
              style={{
                width: 32,
                fontSize: 12,
                color: 'rgba(148, 163, 184, 0.4)',
                textAlign: 'right',
                paddingRight: 8,
              }}
            >
              {pair.num}.
            </span>
            <span
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: 500,
                color:
                  hoveredMove === pair.whiteIdx
                    ? '#f8fafc'
                    : 'rgba(248, 250, 252, 0.7)',
                padding: '2px 8px',
                borderRadius: 4,
                backgroundColor:
                  hoveredMove === pair.whiteIdx
                    ? 'rgba(56, 189, 248, 0.15)'
                    : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={() => {
                setHoveredMove(pair.whiteIdx);
                onMoveHover?.(pair.whiteIdx);
              }}
              onMouseLeave={() => {
                setHoveredMove(null);
                onMoveHover?.(null);
              }}
            >
              {pair.white}
            </span>
            <span
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: 500,
                color:
                  hoveredMove === pair.blackIdx
                    ? '#f8fafc'
                    : 'rgba(148, 163, 184, 0.6)',
                padding: '2px 8px',
                borderRadius: 4,
                backgroundColor:
                  hoveredMove === pair.blackIdx
                    ? 'rgba(56, 189, 248, 0.15)'
                    : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={() => {
                setHoveredMove(pair.blackIdx);
                onMoveHover?.(pair.blackIdx);
              }}
              onMouseLeave={() => {
                setHoveredMove(null);
                onMoveHover?.(null);
              }}
            >
              {pair.black}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
