'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Button, ProgressBar } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { PuzzleBoard } from './PuzzleBoard';
import {
  getRandomPuzzle,
  type ChessPuzzle,
} from '@/features/chess/lib/puzzle-api';
import { usePuzzleState } from '../hooks/usePuzzleState';
import { playTacticsAudio } from '@/features/chess/lib/puzzle-analytics';

export type DuelDifficulty = 'easy' | 'medium' | 'hard' | 'master';

const DIFFICULTY_CONFIG: Record<
  DuelDifficulty,
  {
    label: string;
    botRating: number;
    botName: string;
    solveSecMin: number;
    solveSecMax: number;
    accuracy: number;
  }
> = {
  easy: {
    label: 'Novice',
    botRating: 1000,
    botName: 'Tactics Bot (1000)',
    solveSecMin: 9,
    solveSecMax: 16,
    accuracy: 0.65,
  },
  medium: {
    label: 'Intermediate',
    botRating: 1500,
    botName: 'Tactics Bot (1500)',
    solveSecMin: 6,
    solveSecMax: 12,
    accuracy: 0.82,
  },
  hard: {
    label: 'Advanced',
    botRating: 1900,
    botName: 'Tactics Bot (1900)',
    solveSecMin: 4,
    solveSecMax: 8,
    accuracy: 0.92,
  },
  master: {
    label: 'Master',
    botRating: 2300,
    botName: 'Tactics Bot (2300)',
    solveSecMin: 2,
    solveSecMax: 6,
    accuracy: 0.97,
  },
};

const DUEL_DURATION_SEC = 120;
const MAX_STRIKES = 3;

interface PuzzleDuelProps {
  onBackToMenu?: () => void;
}

export function PuzzleDuel({ onBackToMenu }: PuzzleDuelProps) {
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'ended'>(
    'lobby',
  );
  const [difficulty, setDifficulty] = useState<DuelDifficulty>('medium');
  const [secondsLeft, setSecondsLeft] = useState(DUEL_DURATION_SEC);
  const [userScore, setUserScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [userStrikes, setUserStrikes] = useState(0);
  const [botStrikes, setBotStrikes] = useState(0);
  const [currentPuzzle, setCurrentPuzzle] = useState<ChessPuzzle | null>(null);

  const botTimerRef = useRef<number>(0);
  const botNextSolveTimeRef = useRef<number>(0);

  const activeConfig = DIFFICULTY_CONFIG[difficulty];

  const getNewPuzzle = useCallback(async () => {
    const p = await getRandomPuzzle(activeConfig.botRating);
    setCurrentPuzzle(p);
  }, [activeConfig.botRating]);

  const handleStartDuel = useCallback(async () => {
    setUserScore(0);
    setBotScore(0);
    setUserStrikes(0);
    setBotStrikes(0);
    setSecondsLeft(DUEL_DURATION_SEC);
    setGameState('playing');
    botTimerRef.current = 0;
    botNextSolveTimeRef.current =
      Math.floor(
        Math.random() *
          (activeConfig.solveSecMax - activeConfig.solveSecMin + 1),
      ) + activeConfig.solveSecMin;

    await getNewPuzzle();
  }, [activeConfig, getNewPuzzle]);

  const handlePuzzleSolved = useCallback(() => {
    setUserScore((prev) => prev + 1);
    playTacticsAudio('streak');
    void getNewPuzzle();
  }, [getNewPuzzle]);

  const handlePuzzleFailed = useCallback(() => {
    setUserStrikes((prev) => {
      const next = prev + 1;
      if (next >= MAX_STRIKES) {
        setGameState('ended');
      }
      return next;
    });
    void getNewPuzzle();
  }, [getNewPuzzle]);

  const {
    board,
    playerColor,
    phase,
    selectedSquare,
    legalDestinations,
    lastMove,
    hintMove,
    isCheck,
    kingPosition,
    makeMove,
    selectSquare,
  } = usePuzzleState({
    mode: 'custom',
    customPuzzle: currentPuzzle ?? undefined,
    onSolved: handlePuzzleSolved,
    onFailed: handlePuzzleFailed,
  });

  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameState('ended');
          return 0;
        }
        return prev - 1;
      });

      botTimerRef.current += 1;
      if (botTimerRef.current >= botNextSolveTimeRef.current) {
        botTimerRef.current = 0;
        botNextSolveTimeRef.current =
          Math.floor(
            Math.random() *
              (activeConfig.solveSecMax - activeConfig.solveSecMin + 1),
          ) + activeConfig.solveSecMin;

        const isSuccess = Math.random() < activeConfig.accuracy;
        if (isSuccess) {
          setBotScore((s) => s + 1);
        } else {
          setBotStrikes((st) => {
            const next = st + 1;
            if (next >= MAX_STRIKES) {
              setGameState('ended');
            }
            return next;
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, activeConfig]);

  const resultStatus = useMemo(() => {
    if (userStrikes >= MAX_STRIKES) return 'defeat';
    if (botStrikes >= MAX_STRIKES) return 'victory';
    if (userScore > botScore) return 'victory';
    if (userScore < botScore) return 'defeat';
    return 'draw';
  }, [userStrikes, botStrikes, userScore, botScore]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (gameState === 'lobby') {
    return (
      <div
        data-testid="puzzle-duel-lobby"
        className="w-full max-w-xl mx-auto p-6 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-md flex flex-col items-center text-center gap-6"
      >
        <div className="text-4xl">⚔️</div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color)]">
            Puzzle Duel
          </h2>
          <p className="text-xs text-[var(--textSecondary)] mt-1 max-w-sm">
            Race against the clock in a 2-minute tactical sprint. Out-score the
            tactical bot before time expires or strikes run out!
          </p>
        </div>

        <div className="w-full flex flex-col gap-2 text-left">
          <div className="text-xs font-semibold text-[var(--textSecondary)]">
            Select Opponent Difficulty
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(DIFFICULTY_CONFIG) as DuelDifficulty[]).map((d) => {
              const cfg = DIFFICULTY_CONFIG[d];
              const isSelected = difficulty === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  data-testid={`duel-diff-${d}`}
                  className={cx(
                    'p-3 rounded-xl border text-left flex flex-col gap-1 transition-all',
                    isSelected
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md'
                      : 'bg-[var(--glassBg)] border-[var(--glassBorder)] text-[var(--color)] hover:bg-[var(--backgroundHover)]',
                  )}
                >
                  <div className="text-sm font-bold">{cfg.label}</div>
                  <div className="text-[11px] opacity-80">
                    {cfg.botRating} ELO · ~{Math.round(cfg.accuracy * 100)}%
                    accuracy
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full">
          {onBackToMenu && (
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onBackToMenu}
            >
              Back
            </Button>
          )}
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleStartDuel}
            data-testid="start-duel-btn"
          >
            Start Duel ⚔️
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    return (
      <div
        data-testid="puzzle-duel-game-over"
        className="w-full max-w-lg mx-auto p-6 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-md flex flex-col items-center text-center gap-5"
      >
        <div className="text-5xl">
          {resultStatus === 'victory'
            ? '🏆'
            : resultStatus === 'defeat'
              ? '💀'
              : '🤝'}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color)]">
            {resultStatus === 'victory'
              ? 'Victory! You Won the Duel'
              : resultStatus === 'defeat'
                ? 'Defeat! Opponent Won'
                : 'Duel Draw!'}
          </h2>
          <p className="text-xs text-[var(--textSecondary)] mt-1">
            Final Score: You {userScore} : {botScore} Opponent
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
            <div className="text-xs text-[var(--textSecondary)]">
              Your Score
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5">
              {userScore}
            </div>
            <div className="text-[10px] text-[var(--textSecondary)]">
              Strikes: {'❌'.repeat(userStrikes) || 'None'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
            <div className="text-xs text-[var(--textSecondary)]">
              {activeConfig.botName}
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-0.5">
              {botScore}
            </div>
            <div className="text-[10px] text-[var(--textSecondary)]">
              Strikes: {'❌'.repeat(botStrikes) || 'None'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setGameState('lobby')}
            data-testid="duel-menu-btn"
          >
            Lobby
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleStartDuel}
            data-testid="duel-rematch-btn"
          >
            Rematch ⚔️
          </Button>
        </div>
      </div>
    );
  }

  const userProgress = Math.min(
    100,
    (userScore / Math.max(1, userScore + botScore || 1)) * 100,
  );

  return (
    <div
      data-testid="puzzle-duel-match"
      className="w-full max-w-4xl mx-auto flex flex-col gap-4"
    >
      <div className="p-4 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-md flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[var(--color)]">You</span>
            <span className="text-xl font-mono font-bold text-emerald-400">
              {userScore}
            </span>
            <span className="text-xs text-red-400">
              {'❌'.repeat(userStrikes)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--textSecondary)]">Time:</span>
            <span
              data-testid="duel-timer"
              className="px-2.5 py-0.5 font-mono text-sm font-bold rounded-lg bg-[var(--background)] border border-[var(--glassBorder)] text-[var(--accent)]"
            >
              {formatTimer(secondsLeft)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">
              {'❌'.repeat(botStrikes)}
            </span>
            <span className="text-xl font-mono font-bold text-amber-400">
              {botScore}
            </span>
            <span className="text-lg font-bold text-[var(--color)]">
              {activeConfig.botName.split(' ')[0]}
            </span>
          </div>
        </div>

        <ProgressBar value={userProgress} height={6} />
      </div>

      <div className="flex flex-col items-center">
        {currentPuzzle && board ? (
          <div className="w-full max-w-[min(70vmin,540px)] aspect-square">
            <PuzzleBoard
              puzzle={currentPuzzle}
              phase={phase}
              onMove={makeMove}
              board={board}
              playerColor={playerColor}
              selectedSquare={selectedSquare}
              legalMoves={legalDestinations}
              lastMove={lastMove}
              hintMove={hintMove}
              isCheck={isCheck}
              kingPosition={kingPosition}
              onSelectSquare={selectSquare}
            />
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-xs text-[var(--textSecondary)]">
            Loading duel puzzle...
          </div>
        )}
      </div>
    </div>
  );
}
