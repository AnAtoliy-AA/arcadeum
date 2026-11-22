'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button, Input } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import {
  validateCustomPuzzle,
  saveCustomPuzzle,
  FEN_PRESETS,
  type CustomPuzzleInput,
} from '@/features/chess/lib/custom-puzzles';
import {
  getPuzzleInitialBoard,
  getPuzzleTurnColor,
  applyUciMoveToBoard,
  getLegalDestinations,
} from '../lib/puzzle-chess-engine';
import { PuzzleBoard } from './PuzzleBoard';
import type { ChessPuzzle } from '@/features/chess/lib/puzzle-api';
import type {
  BoardPosition,
  Board,
} from '@arcadeum/games-core/games/chess/chess.types';
import type { PieceColor } from '@arcadeum/games-core/games/chess/chess.constants';

const THEME_OPTIONS = [
  'fork',
  'pin',
  'skewer',
  'mateIn1',
  'mateIn2',
  'mateIn3',
  'backRankMate',
  'smotheredMate',
  'endgame',
  'sacrifice',
  'deflection',
  'discoveredAttack',
];

interface CustomPuzzleCreatorProps {
  onPuzzleCreated: (puzzle: ChessPuzzle) => void;
  onCancel?: () => void;
}

export function CustomPuzzleCreator({
  onPuzzleCreated,
  onCancel,
}: CustomPuzzleCreatorProps) {
  const [title, setTitle] = useState('');
  const [fen, setFen] = useState('6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1');
  const [movesText, setMovesText] = useState('e1e8');
  const [rating, setRating] = useState('1500');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([
    'backRankMate',
  ]);
  const [selectedSquare, setSelectedSquare] = useState<BoardPosition | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const movesList = useMemo(() => {
    return movesText
      .trim()
      .split(/[\s,]+/)
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);
  }, [movesText]);

  const validation = useMemo(() => {
    return validateCustomPuzzle(fen, movesList);
  }, [fen, movesList]);

  const currentBoardState = useMemo(() => {
    try {
      let b: Board = getPuzzleInitialBoard(fen);
      let t: PieceColor = getPuzzleTurnColor(fen);
      let last: { from: BoardPosition; to: BoardPosition } | null = null;

      for (const m of movesList) {
        if (m.length >= 4) {
          const step = applyUciMoveToBoard(b, m);
          b = step.nextBoard;
          t = t === 'white' ? 'black' : 'white';
          last = {
            from: {
              file: m[0] as BoardPosition['file'],
              rank: parseInt(m[1] ?? '1', 10) as BoardPosition['rank'],
            },
            to: {
              file: m[2] as BoardPosition['file'],
              rank: parseInt(m[3] ?? '1', 10) as BoardPosition['rank'],
            },
          };
        }
      }
      return { board: b, turn: t, lastMove: last, valid: true };
    } catch {
      return {
        board: null,
        turn: 'white' as PieceColor,
        lastMove: null,
        valid: false,
      };
    }
  }, [fen, movesList]);

  const playerColor = useMemo(() => {
    try {
      return getPuzzleTurnColor(fen);
    } catch {
      return 'white' as PieceColor;
    }
  }, [fen]);

  const legalDestinations = useMemo(() => {
    if (!currentBoardState.board || !selectedSquare) return [];
    return getLegalDestinations(
      currentBoardState.board,
      currentBoardState.turn,
      selectedSquare,
    );
  }, [currentBoardState, selectedSquare]);

  const handleSelectSquare = useCallback(
    (pos: BoardPosition | null) => {
      if (!pos) {
        setSelectedSquare(null);
        return;
      }
      if (!currentBoardState.board) return;

      if (!selectedSquare) {
        const fileIdx = pos.file.charCodeAt(0) - 97;
        const rankIdx = 8 - pos.rank;
        const piece = currentBoardState.board[rankIdx]?.[fileIdx];
        if (piece && piece.color === currentBoardState.turn) {
          setSelectedSquare(pos);
        }
        return;
      }

      if (
        selectedSquare.file === pos.file &&
        selectedSquare.rank === pos.rank
      ) {
        setSelectedSquare(null);
        return;
      }

      const isLegal = legalDestinations.some(
        (dest) => dest.file === pos.file && dest.rank === pos.rank,
      );

      if (isLegal) {
        const uci = `${selectedSquare.file}${selectedSquare.rank}${pos.file}${pos.rank}`;
        setMovesText((prev) => (prev.trim() ? `${prev.trim()} ${uci}` : uci));
        setSelectedSquare(null);
      } else {
        const fileIdx = pos.file.charCodeAt(0) - 97;
        const rankIdx = 8 - pos.rank;
        const piece = currentBoardState.board[rankIdx]?.[fileIdx];
        if (piece && piece.color === currentBoardState.turn) {
          setSelectedSquare(pos);
        } else {
          setSelectedSquare(null);
        }
      }
    },
    [currentBoardState, selectedSquare, legalDestinations],
  );

  const handlePreset = useCallback(
    (preset: { fen: string; moves: string[]; label: string }) => {
      setFen(preset.fen);
      setMovesText(preset.moves.join(' '));
      setTitle(preset.label);
      setSelectedSquare(null);
    },
    [],
  );

  const handleUndoMove = useCallback(() => {
    if (movesList.length === 0) return;
    const remaining = movesList.slice(0, -1);
    setMovesText(remaining.join(' '));
    setSelectedSquare(null);
  }, [movesList]);

  const handleClearMoves = useCallback(() => {
    setMovesText('');
    setSelectedSquare(null);
  }, []);

  const toggleTheme = useCallback((theme: string) => {
    setSelectedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme],
    );
  }, []);

  const handleSave = useCallback(() => {
    if (!validation.valid) {
      setErrorMsg(validation.error ?? 'Please fix puzzle validation errors');
      return;
    }

    const input: CustomPuzzleInput = {
      title: title.trim() || 'Custom Chess Puzzle',
      fen: fen.trim(),
      moves: movesList,
      rating: parseInt(rating, 10) || 1500,
      themes: selectedThemes,
    };

    const saved = saveCustomPuzzle(input);
    onPuzzleCreated(saved);
  }, [
    validation,
    title,
    fen,
    movesList,
    rating,
    selectedThemes,
    onPuzzleCreated,
  ]);

  return (
    <div
      data-testid="custom-puzzle-creator"
      className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-6 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-md"
    >
      <div className="flex items-center justify-between border-b border-[var(--glassBorder)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--color)]">
            Create Custom Chess Puzzle
          </h2>
          <p className="text-xs text-[var(--textSecondary)] mt-0.5">
            Set up the board position and click or enter tactical moves
          </p>
        </div>
        {onCancel && (
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 flex flex-col items-center gap-3">
          <div className="text-xs font-semibold text-[var(--textSecondary)] self-start">
            Board Preview ({currentBoardState.turn} to move)
          </div>

          {currentBoardState.board ? (
            <div className="w-full max-w-[380px] aspect-square">
              <PuzzleBoard
                board={currentBoardState.board}
                playerColor={playerColor}
                selectedSquare={selectedSquare}
                legalMoves={legalDestinations}
                lastMove={currentBoardState.lastMove}
                hintMove={null}
                isCheck={false}
                kingPosition={null}
                onSelectSquare={handleSelectSquare}
              />
            </div>
          ) : (
            <div className="w-full max-w-[380px] aspect-square flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 text-center">
              Invalid FEN placement string. Please check position notation.
            </div>
          )}

          <div className="flex items-center gap-2 w-full max-w-[380px] justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUndoMove}
              disabled={movesList.length === 0}
              data-testid="undo-move-btn"
            >
              Undo Move
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearMoves}
              disabled={movesList.length === 0}
              data-testid="clear-moves-btn"
            >
              Clear Moves
            </Button>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--textSecondary)] mb-1">
              Puzzle Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Queen Sacrifice Checkmate"
              data-testid="custom-puzzle-title-input"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[var(--textSecondary)]">
                FEN Position
              </label>
              <div className="flex gap-1 flex-wrap">
                {FEN_PRESETS.slice(0, 2).map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePreset(p)}
                    className="text-[10px] px-2 py-0.5 rounded bg-[var(--backgroundHover)] hover:bg-[var(--primary)] hover:text-white text-[var(--textSecondary)] transition-colors"
                  >
                    {p.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <Input
              value={fen}
              onChange={(e) => {
                setFen(e.target.value);
                setSelectedSquare(null);
              }}
              placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
              data-testid="custom-puzzle-fen-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--textSecondary)] mb-1">
              Solution Moves (UCI: e1e8 or click board)
            </label>
            <Input
              value={movesText}
              onChange={(e) => {
                setMovesText(e.target.value);
                setSelectedSquare(null);
              }}
              placeholder="e2e4 e7e5 g1f3"
              data-testid="custom-puzzle-moves-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--textSecondary)] mb-1">
                Estimated Rating
              </label>
              <Input
                type="number"
                min="400"
                max="3000"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                data-testid="custom-puzzle-rating-input"
              />
            </div>
            <div className="flex flex-col justify-end">
              <div className="text-xs text-[var(--textSecondary)] pb-2">
                Move count:{' '}
                <span className="font-bold text-[var(--color)]">
                  {movesList.length}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--textSecondary)] mb-1.5">
              Tactical Themes
            </label>
            <div className="flex flex-wrap gap-1.5">
              {THEME_OPTIONS.map((thm) => {
                const active = selectedThemes.includes(thm);
                return (
                  <button
                    key={thm}
                    type="button"
                    onClick={() => toggleTheme(thm)}
                    className={cx(
                      'px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150',
                      active
                        ? 'bg-[var(--primary)] text-white shadow-xs'
                        : 'bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)]',
                    )}
                  >
                    {thm}
                  </button>
                );
              })}
            </div>
          </div>

          {validation.valid ? (
            <div
              data-testid="validation-success-banner"
              className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2"
            >
              <span>✓</span>
              <span>
                Valid Tactical Sequence: {validation.plyCount} plies (
                {validation.turn} to play)
              </span>
            </div>
          ) : (
            <div
              data-testid="validation-error-banner"
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2"
            >
              <span>✕</span>
              <span>{validation.error}</span>
            </div>
          )}

          {errorMsg && (
            <div className="text-xs text-red-400 font-medium">{errorMsg}</div>
          )}

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!validation.valid}
              data-testid="save-custom-puzzle-btn"
            >
              Save Custom Puzzle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
