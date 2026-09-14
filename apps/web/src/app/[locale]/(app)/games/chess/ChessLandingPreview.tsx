'use client';

import { useState } from 'react';
import { GameLandingPreview } from '@/features/games/ui/landing/GameLandingPreview';
import { useGameLandingTheme } from '@/features/games/ui/landing/GameLandingThemeContext';
import {
  getChessTheme,
  boardVars,
} from '@/widgets/BoardGames/ChessGame/lib/theme';
import { Button } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';

type BoardState = Array<Array<string | null>>;

const INITIAL_BOARD: BoardState = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const PIECE_GLYPHS: Record<string, string> = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

interface MovePreset {
  id: string;
  name: string;
  whiteMove: string;
  from: [number, number];
  to: [number, number];
  blackMove: string;
  blackFrom: [number, number];
  blackTo: [number, number];
  openingName: string;
  evalText: string;
}

const PRESETS: MovePreset[] = [
  {
    id: 'e4',
    name: '1. e4 (King Pawn)',
    whiteMove: '1. e4',
    from: [6, 4],
    to: [4, 4],
    blackMove: '1...c5',
    blackFrom: [1, 2],
    blackTo: [3, 2],
    openingName: 'Sicilian Defense',
    evalText: '+0.25 (Stockfish 19 · Depth 22)',
  },
  {
    id: 'd4',
    name: '1. d4 (Queen Pawn)',
    whiteMove: '1. d4',
    from: [6, 3],
    to: [4, 3],
    blackMove: '1...Nf6',
    blackFrom: [0, 6],
    blackTo: [2, 5],
    openingName: 'Indian Defense',
    evalText: '+0.30 (Stockfish 19 · Depth 22)',
  },
  {
    id: 'Nf3',
    name: '1. Nf3 (Réti)',
    whiteMove: '1. Nf3',
    from: [7, 6],
    to: [5, 5],
    blackMove: '1...d5',
    blackFrom: [1, 3],
    blackTo: [3, 3],
    openingName: 'Réti Opening',
    evalText: '+0.20 (Stockfish 19 · Depth 22)',
  },
];

function cloneBoard(b: BoardState): BoardState {
  return b.map((row) => [...row]);
}

export function ChessLandingPreview() {
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [activePreset, setActivePreset] = useState<MovePreset | null>(null);
  const [highlightSquares, setHighlightSquares] = useState<
    Array<[number, number]>
  >([]);
  const { theme: contextTheme } = useGameLandingTheme();

  const handlePlayMove = (preset: MovePreset) => {
    const next = cloneBoard(INITIAL_BOARD);
    const whitePiece = next[preset.from[0]][preset.from[1]];
    next[preset.from[0]][preset.from[1]] = null;
    next[preset.to[0]][preset.to[1]] = whitePiece;

    const blackPiece = next[preset.blackFrom[0]][preset.blackFrom[1]];
    next[preset.blackFrom[0]][preset.blackFrom[1]] = null;
    next[preset.blackTo[0]][preset.blackTo[1]] = blackPiece;

    setBoard(next);
    setActivePreset(preset);
    setHighlightSquares([preset.to, preset.blackTo]);
  };

  const handleReset = () => {
    setBoard(INITIAL_BOARD);
    setActivePreset(null);
    setHighlightSquares([]);
  };

  return (
    <GameLandingPreview
      testId="chess-landing-preview"
      interactive
      render={(themeId) => {
        const resolvedThemeId = themeId || contextTheme;
        const currentTheme = getChessTheme(resolvedThemeId);
        const vars = boardVars(currentTheme);

        return (
          <div className="flex flex-col items-center gap-3 w-full">
            <style>{`
              .clp-chess-board{box-sizing:border-box;width:100%;max-width:360px;margin:0 auto;aspect-ratio:1/1;padding:10px;border-radius:var(--chess-border-radius,16px);border:2px solid var(--chess-selected-square,rgba(245,158,11,.4));box-shadow:0 16px 40px rgba(0,0,0,.5);display:grid;grid-template-columns:repeat(8,minmax(0,1fr));grid-template-rows:repeat(8,minmax(0,1fr));gap:2px;background:var(--chess-board-bg,#78350f);transition:background-color .25s ease,border-color .25s ease}
              .clp-sq{box-sizing:border-box;display:flex;align-items:center;justify-content:center;border-radius:2px;font-size:20px;font-weight:700;user-select:none;position:relative;transition:background-color .2s ease}
              .clp-sq-l{background:var(--chess-square-light,#f0d9b5)}
              .clp-sq-d{background:var(--chess-square-dark,#b58863)}
              .clp-moved{background:var(--chess-last-move,#cdd26a)}
              .clp-piece-w{color:var(--chess-piece-light,#fff);filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))}
              .clp-piece-b{color:var(--chess-piece-dark,#18181b);filter:drop-shadow(0 1px 1px rgba(255,255,255,.25))}
            `}</style>

            <div className="flex items-center justify-between w-full max-w-[320px] text-xs font-bold">
              <span className="text-[var(--color)] font-bold">
                {activePreset ? 'Stockfish 19 Eval' : 'Stockfish 19 Ready'}
              </span>
              <span className="opacity-90">
                {activePreset ? activePreset.evalText : 'Make a move below'}
              </span>
            </div>

            <div className="flex h-1.5 w-full max-w-[320px] rounded-full overflow-hidden bg-[#18181b] border border-[rgba(255,255,255,0.2)]">
              <div
                className={cx(
                  'bg-[#f8fafc] transition-[width] duration-[0.3s]',
                  activePreset ? 'w-[56%]' : 'w-1/2',
                )}
              />
              <div className="bg-[#334155] flex-1" />
            </div>

            <div
              aria-label="Interactive Chess Board"
              className="clp-chess-board"
              style={vars}
            >
              {board.map((row, rowIdx) =>
                row.map((cell, colIdx) => {
                  const isLight = (rowIdx + colIdx) % 2 === 0;
                  const isHighlighted = highlightSquares.some(
                    ([r, c]) => r === rowIdx && c === colIdx,
                  );
                  const isWhite = cell ? cell === cell.toUpperCase() : false;

                  return (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      className={cx(
                        'clp-sq',
                        isLight ? 'clp-sq-l' : 'clp-sq-d',
                        isHighlighted && 'clp-moved',
                      )}
                    >
                      {cell ? (
                        <span
                          className={isWhite ? 'clp-piece-w' : 'clp-piece-b'}
                        >
                          {PIECE_GLYPHS[cell]}
                        </span>
                      ) : null}
                    </div>
                  );
                }),
              )}
            </div>

            <div className="flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] text-[var(--foreground)] text-center max-w-[320px]">
              {activePreset ? (
                <span>
                  {activePreset.whiteMove} ➔{' '}
                  <strong>{activePreset.blackMove}</strong> (
                  {activePreset.openingName})
                </span>
              ) : (
                <span>Try an opening move against Stockfish 19:</span>
              )}
            </div>

            <div className="flex gap-2 w-full max-w-[320px] justify-center">
              {!activePreset ? (
                PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlayMove(preset)}
                  >
                    {preset.whiteMove}
                  </Button>
                ))
              ) : (
                <Button variant="secondary" size="sm" onClick={handleReset}>
                  Reset Board
                </Button>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}
