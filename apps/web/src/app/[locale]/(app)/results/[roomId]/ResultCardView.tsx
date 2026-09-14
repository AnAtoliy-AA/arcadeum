'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { Button, Spinner } from '@arcadeum/ui';
import { useLocale } from '@/shared/config/useRoutes';
import { shareLink } from '@/shared/lib/share';

interface ResultParticipant {
  userId: string;
  displayName: string;
  isWinner: boolean;
}

interface GameResult {
  sessionId: string;
  roomId: string;
  gameId: string;
  gameName: string;
  completedAt: string;
  isDraw: boolean;
  participants: ResultParticipant[];
  ratingDeltas?: Record<string, number>;
}

const GAME_ACCENTS: Record<string, string> = {
  chess_v1: '#f59e0b',
  checkers_v1: '#ef4444',
  backgammon_v1: '#10b981',
  go_v1: '#6366f1',
  hearts_v1: '#ec4899',
  spades_v1: '#3b82f6',
  sea_battle_v1: '#06b6d4',
  critical_v1: '#f97316',
  tic_tac_toe_v1: '#8b5cf6',
  minesweeper_v1: '#22c55e',
  game_2048_v1: '#eab308',
  solitaire_v1: '#dc2626',
  sudoku_v1: '#2563eb',
  cascade_v1: '#14b8a6',
  glimworm_v1: '#a855f7',
  cat_dash_v1: '#f43f5e',
  pachisi_v1: '#d946ef',
};

interface ResultCardViewProps {
  roomId: string;
  result: GameResult | null;
}

export function ResultCardView({ roomId, result }: ResultCardViewProps) {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/${locale}/results/${roomId}`;
    const winner = result?.participants.find((p) => p.isWinner);
    const resultText = result?.isDraw
      ? 'Draw'
      : winner
        ? `${winner.displayName} won ${result?.gameName}!`
        : `Played ${result?.gameName}`;

    const success = await shareLink({
      title: `${result?.gameName ?? 'Game'} Result — Arcadeum Games`,
      text: `${resultText} Play free online games at Arcadeum!`,
      url,
      event: 'result.shared',
    });

    if (success) {
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 3000);
    }
  }, [roomId, result, locale]);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b14]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="md" />
          <p className="text-sm text-[var(--textSecondary)]">
            Loading result...
          </p>
        </div>
      </div>
    );
  }

  const accent = GAME_ACCENTS[result.gameId] ?? '#f59e0b';
  const winner = result.participants.find((p) => p.isWinner);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b14] p-4">
      <div
        className="flex w-full max-w-lg flex-col items-center gap-6 rounded-3xl border p-8 text-center backdrop-blur-md"
        style={{
          borderColor: `${accent}30`,
          background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, ${accent}08 100%)`,
        }}
      >
        {/* Game name */}
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--textSecondary)]">
          {result.gameName}
        </span>

        {/* Result */}
        {result.isDraw ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-6xl">🤝</span>
            <h1 className="text-3xl font-bold">Draw</h1>
          </div>
        ) : winner ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-6xl">🏆</span>
            <h1 className="text-3xl font-bold">{winner.displayName}</h1>
            <span
              className="text-sm font-semibold uppercase"
              style={{ color: '#22c55e' }}
            >
              Winner
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-6xl">🎮</span>
            <h1 className="text-3xl font-bold">Game Completed</h1>
          </div>
        )}

        {/* Players */}
        <div className="flex w-full flex-col gap-2">
          {result.participants.map((p) => (
            <div
              key={p.userId}
              className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{p.isWinner ? '🏆' : '👤'}</span>
                <span className="font-semibold">{p.displayName}</span>
              </div>
              <div className="flex items-center gap-2">
                {result.ratingDeltas?.[p.userId] && (
                  <span
                    className="text-sm font-bold"
                    style={{
                      color:
                        result.ratingDeltas[p.userId] > 0
                          ? '#22c55e'
                          : '#ef4444',
                    }}
                  >
                    {result.ratingDeltas[p.userId] > 0 ? '+' : ''}
                    {result.ratingDeltas[p.userId]}
                  </span>
                )}
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{
                    background: p.isWinner
                      ? `${accent}20`
                      : 'rgba(255,255,255,0.06)',
                    color: p.isWinner ? accent : 'var(--textSecondary)',
                  }}
                >
                  {p.isWinner ? 'WIN' : 'LOSS'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleShare}
            className="w-full"
          >
            {copied ? '✓ Copied!' : '🔗 Share Result'}
          </Button>

          <Link
            href={`/${locale}/games/${result.gameId.replace(/_v\d+$/, '')}`}
            className="flex items-center justify-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-3.5 py-2.5 text-sm font-semibold text-[rgba(255,255,255,0.7)] no-underline transition-all hover:bg-[rgba(255,255,255,0.06)]"
          >
            Play Again →
          </Link>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-[var(--textSecondary)]">
          {new Date(result.completedAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
