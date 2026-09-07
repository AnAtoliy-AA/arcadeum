'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { File, Rank } from '@arcadeum/games-core/games/chess/chess.types';
import { FILES, PIECE_SYMBOLS } from '@arcadeum/games-core/games/chess/chess.constants';
import { useTranslation } from '@/shared/lib/useTranslation';

type Mode = 'findSquare' | 'nameSquare';
type Phase = 'menu' | 'playing' | 'gameover';

const DURATION = 30;

function randomSquare(): { file: File; rank: Rank } {
  return {
    file: FILES[Math.floor(Math.random() * 8)] as File,
    rank: (Math.floor(Math.random() * 8) + 1) as Rank,
  };
}

function randomPiece() {
  const types = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'] as const;
  const colors = ['white', 'black'] as const;
  return {
    type: types[Math.floor(Math.random() * types.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

export function CoordinateTrainer() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('menu');
  const [mode, setMode] = useState<Mode>('findSquare');
  const [flipBoard, setFlipBoard] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [targetSquare, setTargetSquare] = useState<{ file: File; rank: Rank } | null>(null);
  const [highlightSquare, setHighlightSquare] = useState<{ file: File; rank: Rank } | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [boardPieces] = useState(() => {
    const pieces: Map<string, { type: string; color: string }> = new Map();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (Math.random() < 0.35) {
          const p = randomPiece();
          pieces.set(`${FILES[c]}${8 - r}`, p);
        }
      }
    }
    return pieces;
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const ranks: Rank[] = flipBoard ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files: File[] = flipBoard ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const nextTarget = useCallback(() => {
    const sq = randomSquare();
    setTargetSquare(sq);
    setHighlightSquare(null);
    setIsCorrect(null);
    setNameInput('');
  }, []);

  const startGame = useCallback((selectedMode: Mode) => {
    setMode(selectedMode);
    setPhase('playing');
    setScore(0);
    setStreak(0);
    setTimeLeft(DURATION);
    const sq = randomSquare();
    setTargetSquare(sq);
    setHighlightSquare(null);
    setIsCorrect(null);
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { stopTimer(); setPhase('gameover'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return stopTimer;
  }, [phase, stopTimer]);

  const handleSquareClick = useCallback((file: File, rank: Rank) => {
    if (phase !== 'playing' || mode !== 'findSquare' || !targetSquare) return;
    const correct = file === targetSquare.file && rank === targetSquare.rank;
    setIsCorrect(correct);
    setHighlightSquare({ file, rank });
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => { const n = s + 1; if (n > bestStreak) setBestStreak(n); return n; });
    } else {
      setStreak(0);
    }
    setTimeout(nextTarget, correct ? 300 : 600);
  }, [phase, mode, targetSquare, nextTarget, bestStreak]);

  const handleNameSubmit = useCallback((name: string) => {
    if (phase !== 'playing' || mode !== 'nameSquare' || !targetSquare) return;
    const clean = name.trim().toLowerCase();
    const correct = clean === `${targetSquare.file}${targetSquare.rank}`;
    setIsCorrect(correct);
    setHighlightSquare(targetSquare);
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => { const n = s + 1; if (n > bestStreak) setBestStreak(n); return n; });
    } else {
      setStreak(0);
    }
    setTimeout(nextTarget, correct ? 300 : 600);
  }, [phase, mode, targetSquare, nextTarget, bestStreak]);

  useEffect(() => {
    if (phase === 'playing' && mode === 'nameSquare' && targetSquare) {
      nameInputRef.current?.focus();
    }
  }, [phase, mode, targetSquare]);

  const handleNameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSubmit(nameInput);
    }
  }, [nameInput, handleNameSubmit]);

  if (phase === 'menu') {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Coordinate Trainer</h2>
          <p className="text-sm text-[var(--textSecondary)] max-w-md">
            Learn chess board coordinates by heart. Know instantly where every square is — essential for speed chess and communication.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => startGame('findSquare')}
            className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Find the Square
          </button>
          <button
            onClick={() => startGame('nameSquare')}
            className="px-6 py-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--text)] font-semibold hover:bg-[var(--backgroundHover)] transition-colors"
          >
            Name the Square
          </button>
        </div>

        <div className="flex gap-3 text-xs text-[var(--textSecondary)]">
          <button
            onClick={() => setFlipBoard((f) => !f)}
            className="px-3 py-1.5 rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)] hover:text-[var(--color)] transition-colors"
          >
            {flipBoard ? 'White Perspective' : 'Black Perspective'}
          </button>
        </div>

        <div className="w-full max-w-[400px] aspect-square rounded-xl overflow-hidden border-2 border-[rgba(255,255,255,0.1)]">
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
            {ranks.map((rank) =>
              files.map((file) => {
                const rowIdx = 8 - rank;
                const colIdx = FILES.indexOf(file);
                const isLight = (rowIdx + colIdx) % 2 === 0;
                const piece = boardPieces.get(`${file}${rank}`);
                return (
                  <div
                    key={`${file}-${rank}`}
                    className="flex items-center justify-center"
                    style={{ backgroundColor: isLight ? '#e8d5b5' : '#a97d50', aspectRatio: '1 / 1' }}
                  >
                    {piece && (
                      <span className="text-[min(5vmin,2.5rem)] leading-none select-none opacity-60">
                        {PIECE_SYMBOLS[piece.type as keyof typeof PIECE_SYMBOLS][piece.color as 'white' | 'black']}
                      </span>
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-2">Time&apos;s Up!</h2>
          <p className="text-sm text-[var(--textSecondary)]">
            {mode === 'findSquare' ? 'Find the Square' : 'Name the Square'}
          </p>
        </div>

        <div className="flex gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-[var(--primary)]">{score}</div>
            <div className="text-xs text-[var(--textSecondary)]">Score</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[var(--color)]">{bestStreak}</div>
            <div className="text-xs text-[var(--textSecondary)]">Best Streak</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => startGame(mode)}
            className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Play Again
          </button>
          <button
            onClick={() => setPhase('menu')}
            className="px-6 py-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--text)] font-semibold hover:bg-[var(--backgroundHover)] transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const promptText = mode === 'findSquare'
    ? `Find: ${targetSquare?.file}${targetSquare?.rank}`
    : 'What square is highlighted?';

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex items-center justify-between w-full max-w-[400px]">
        <button
          onClick={() => { stopTimer(); setPhase('menu'); }}
          className="px-3 py-1.5 text-xs rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:text-[var(--color)] transition-colors"
        >
          Quit
        </button>
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold text-[var(--text)]">{score}</div>
          <div className={`text-sm font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-[var(--textSecondary)]'}`}>
            {timeLeft}s
          </div>
          <div className="text-xs text-[var(--textSecondary)]">🔥 {streak}</div>
        </div>
      </div>

      <div className={`text-lg font-bold ${isCorrect === true ? 'text-green-400' : isCorrect === false ? 'text-red-400' : 'text-[var(--text)]'}`}>
        {promptText}
      </div>

      {mode === 'nameSquare' && (
        <input
          ref={nameInputRef}
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={handleNameKeyDown}
          className="w-full max-w-[200px] px-4 py-2 text-center text-lg font-mono rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
          placeholder="e.g. e4"
          autoComplete="off"
          autoFocus
        />
      )}

      <div className="w-full max-w-[400px] aspect-square rounded-xl overflow-hidden border-2 border-[rgba(255,255,255,0.1)] shadow-2xl">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {ranks.map((rank) =>
            files.map((file) => {
              const rowIdx = 8 - rank;
              const colIdx = FILES.indexOf(file);
              const isLight = (rowIdx + colIdx) % 2 === 0;
              const isTarget = targetSquare?.file === file && targetSquare?.rank === rank;
              const isHighlighted = highlightSquare?.file === file && highlightSquare?.rank === rank;
              const piece = boardPieces.get(`${file}${rank}`);

              let bgColor = isLight ? '#e8d5b5' : '#a97d50';
              if (mode === 'findSquare' && isTarget) bgColor = 'rgba(34, 197, 94, 0.5)';
              if (isHighlighted && isCorrect === false) bgColor = 'rgba(239, 68, 68, 0.5)';
              if (isHighlighted && isCorrect === true) bgColor = 'rgba(34, 197, 94, 0.5)';

              return (
                <div
                  key={`${file}-${rank}`}
                  className="flex items-center justify-center"
                  style={{ backgroundColor: bgColor, aspectRatio: '1 / 1' }}
                  onClick={() => handleSquareClick(file, rank)}
                >
                  {piece && (
                    <span className="text-[min(5vmin,2.5rem)] leading-none select-none opacity-60">
                      {PIECE_SYMBOLS[piece.type as keyof typeof PIECE_SYMBOLS][piece.color as 'white' | 'black']}
                    </span>
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>

      <div className="flex gap-1 text-[10px] text-[var(--textSecondary)] opacity-60">
        {files.map((f) => <span key={f} className="w-8 text-center">{f}</span>)}
      </div>
    </div>
  );
}
