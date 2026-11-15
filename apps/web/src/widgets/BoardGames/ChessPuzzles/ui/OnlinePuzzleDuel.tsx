'use client';

import { useState, useCallback, useEffect, memo } from 'react';
import { Button, ProgressBar } from '@arcadeum/ui';
import { PuzzleBoard } from './PuzzleBoard';
import { usePuzzleState } from '../hooks/usePuzzleState';
import {
  getRandomPuzzle,
  type ChessPuzzle,
} from '@/features/chess/lib/puzzle-api';
import { playTacticsAudio } from '@/features/chess/lib/puzzle-analytics';
import { getChessPuzzleDuelSocket } from '@/features/chess/lib/puzzle-duel-socket';

interface OnlinePuzzleDuelProps {
  initialRoomCode?: string;
  onBackToBot?: () => void;
}

type DuelStage = 'lobby' | 'countdown' | 'playing' | 'gameover';

function OnlinePuzzleDuelImpl({
  initialRoomCode,
  onBackToBot,
}: OnlinePuzzleDuelProps) {
  const [stage, setStage] = useState<DuelStage>('lobby');
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [puzzles, setPuzzles] = useState<ChessPuzzle[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [myStrikes, setMyStrikes] = useState(0);

  const [oppScore, setOppScore] = useState(0);
  const [oppStrikes, setOppStrikes] = useState(0);

  const currentPuzzle = puzzles[currentIdx] ?? null;

  const handleNextPuzzle = useCallback(() => {
    setCurrentIdx((prev) => {
      const next = prev + 1;
      if (next >= puzzles.length) {
        setStage('gameover');
      }
      return next;
    });
  }, [puzzles.length]);

  const handleSolved = useCallback(() => {
    playTacticsAudio('solve');
    setMyScore((s) => {
      const next = s + 1;
      const socket = getChessPuzzleDuelSocket();
      socket.emit('puzzle.duel.progress', {
        roomCode,
        score: next,
        strikes: myStrikes,
        puzzleIndex: currentIdx + 1,
      });
      return next;
    });
    handleNextPuzzle();
  }, [roomCode, myStrikes, currentIdx, handleNextPuzzle]);

  const handleFailed = useCallback(() => {
    playTacticsAudio('fail');
    setMyStrikes((st) => {
      const next = st + 1;
      const socket = getChessPuzzleDuelSocket();
      socket.emit('puzzle.duel.progress', {
        roomCode,
        score: myScore,
        strikes: next,
        puzzleIndex: currentIdx + 1,
      });
      if (next >= 3) {
        setStage('gameover');
      }
      return next;
    });
    handleNextPuzzle();
  }, [roomCode, myScore, currentIdx, handleNextPuzzle]);

  const {
    puzzle,
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
    onSolved: handleSolved,
    onFailed: handleFailed,
  });

  const loadPuzzleBatch = useCallback(async () => {
    const list: ChessPuzzle[] = [];
    for (let i = 0; i < 15; i++) {
      const p = await getRandomPuzzle(1200 + i * 50);
      if (p) list.push(p);
    }
    setPuzzles(list);
  }, []);

  const handleCreateRoom = useCallback(() => {
    setErrorMessage(null);
    const socket = getChessPuzzleDuelSocket();
    if (!socket.connected) {
      socket.connect();
    }

    const code = `DUEL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setRoomCode(code);
    socket.emit('puzzle.duel.create');
    void loadPuzzleBatch();
  }, [loadPuzzleBatch]);

  const handleJoinRoom = useCallback(() => {
    const code = (inputCode || roomCode).trim().toUpperCase();
    if (!code) {
      setErrorMessage('Please enter a room code');
      return;
    }
    setErrorMessage(null);
    setRoomCode(code);

    const socket = getChessPuzzleDuelSocket();
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('puzzle.duel.join', { roomCode: code });
    void loadPuzzleBatch();
    setStage('playing');
  }, [inputCode, roomCode, loadPuzzleBatch]);

  const handleCopyLink = useCallback(() => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/games/chess/puzzles/duel?room=${roomCode}`;
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(url);
      setCopied(true);
    }
  }, [roomCode]);

  useEffect(() => {
    const socket = getChessPuzzleDuelSocket();

    const onStart = () => {
      setStage('playing');
    };

    const onOpponentProgress = (data: { score: number; strikes: number }) => {
      setOppScore(data.score);
      setOppStrikes(data.strikes);
      if (data.strikes >= 3) {
        setStage('gameover');
      }
    };

    const onEnded = () => {
      setStage('gameover');
    };

    socket.on('puzzle.duel.start', onStart);
    socket.on('puzzle.duel.opponent_progress', onOpponentProgress);
    socket.on('puzzle.duel.ended', onEnded);

    return () => {
      socket.off('puzzle.duel.start', onStart);
      socket.off('puzzle.duel.opponent_progress', onOpponentProgress);
      socket.off('puzzle.duel.ended', onEnded);
    };
  }, []);

  const handleRematch = useCallback(() => {
    setMyScore(0);
    setMyStrikes(0);
    setOppScore(0);
    setOppStrikes(0);
    setCurrentIdx(0);
    setStage('playing');
    void loadPuzzleBatch();
  }, [loadPuzzleBatch]);

  return (
    <div
      data-testid="online-puzzle-duel"
      className="w-full flex flex-col items-center gap-4"
    >
      <div className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
        <Button
          variant="secondary"
          size="sm"
          onClick={onBackToBot}
          data-testid="back-to-bot-btn"
        >
          ← Solo vs Bot
        </Button>
        <div className="text-xs font-semibold text-[var(--color)]">
          {stage === 'playing' ? `Room: ${roomCode}` : '1v1 Live Online Duel'}
        </div>
      </div>

      {stage === 'lobby' && (
        <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] flex flex-col gap-5">
          <div>
            <h3 className="text-lg font-bold text-[var(--color)]">
              Live Multiplayer Duel
            </h3>
            <p className="text-xs text-[var(--textSecondary)] mt-1">
              Race simultaneously against an online rival or friend on identical
              puzzles.
            </p>
          </div>

          {!roomCode ? (
            <div className="flex flex-col gap-4">
              <Button
                variant="primary"
                onClick={handleCreateRoom}
                data-testid="create-room-btn"
              >
                Create New Duel Room
              </Button>

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-[var(--glassBorder)]" />
                <span className="text-[10px] text-[var(--textSecondary)] uppercase">
                  or join
                </span>
                <div className="h-px flex-1 bg-[var(--glassBorder)]" />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter DUEL-XXXX"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--glassBorder)] text-xs text-[var(--textPrimary)] uppercase font-mono"
                  data-testid="join-room-input"
                />
                <Button
                  variant="secondary"
                  onClick={handleJoinRoom}
                  data-testid="join-room-btn"
                >
                  Join
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center text-center">
              <div className="text-xs text-[var(--textSecondary)]">
                Share this room code with your opponent:
              </div>
              <div
                data-testid="room-code-display"
                className="text-2xl font-mono font-bold text-[var(--primary)] px-4 py-2 rounded-xl bg-[var(--background)] border border-[var(--primary)]/40"
              >
                {roomCode}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyLink}
                data-testid="copy-room-link-btn"
              >
                {copied ? 'Link Copied!' : 'Copy Invite Link'}
              </Button>

              <div className="flex items-center gap-2 text-xs text-amber-400 mt-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Waiting for opponent to connect...
              </div>

              <Button
                variant="primary"
                onClick={() => setStage('playing')}
                data-testid="start-solo-race-btn"
              >
                Start Race Now
              </Button>
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMessage}
            </div>
          )}
        </div>
      )}

      {stage === 'playing' && (
        <div className="w-full flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400">You</span>
                <span className="font-bold text-base">{myScore}</span>
              </div>
              <ProgressBar
                value={Math.min(100, (myScore / 15) * 100)}
                color="var(--success)"
              />
              <div className="text-[10px] text-[var(--textSecondary)]">
                Strikes: {'❌'.repeat(myStrikes) || 'None'}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-400">Rival</span>
                <span className="font-bold text-base">{oppScore}</span>
              </div>
              <ProgressBar
                value={Math.min(100, (oppScore / 15) * 100)}
                color="var(--primary)"
              />
              <div className="text-[10px] text-[var(--textSecondary)]">
                Strikes: {'❌'.repeat(oppStrikes) || 'None'}
              </div>
            </div>
          </div>

          {currentPuzzle && (
            <div className="w-full max-w-[560px] mx-auto">
              <PuzzleBoard
                puzzle={puzzle ?? currentPuzzle}
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
          )}
        </div>
      )}

      {stage === 'gameover' && (
        <div
          data-testid="duel-gameover-card"
          className="w-full max-w-md p-6 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] flex flex-col items-center text-center gap-4 animate-in fade-in"
        >
          <div className="text-3xl">
            {myScore > oppScore ? '🏆' : myScore < oppScore ? '💔' : '🤝'}
          </div>
          <h2 className="text-2xl font-bold text-[var(--color)]">
            {myScore > oppScore
              ? 'Victory!'
              : myScore < oppScore
                ? 'Defeat'
                : 'Draw!'}
          </h2>
          <div className="text-xs text-[var(--textSecondary)]">
            Final Score: You {myScore} - {oppScore} Rival
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={onBackToBot}
              data-testid="exit-duel-btn"
            >
              Exit
            </Button>
            <Button
              variant="primary"
              onClick={handleRematch}
              data-testid="rematch-duel-btn"
            >
              Rematch
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export const OnlinePuzzleDuel = memo(OnlinePuzzleDuelImpl);
