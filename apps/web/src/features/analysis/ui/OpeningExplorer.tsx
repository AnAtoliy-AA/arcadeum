'use client';

import { memo, useState, useEffect, useRef } from 'react';
import { resolveApiUrl } from '@/shared/lib/api-base';

interface ExplorerMove {
  move: string;
  white: number;
  draws: number;
  black: number;
  totalGames: number;
  opening: string;
  eco: string;
}

interface OpeningExplorerProps {
  fen: string;
}

function OpeningExplorerImpl({ fen }: OpeningExplorerProps) {
  const [moves, setMoves] = useState<ExplorerMove[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const lastFenRef = useRef('');

  useEffect(() => {
    if (!fen || fen === lastFenRef.current) return;
    lastFenRef.current = fen;
    setStatus('loading');
    let cancelled = false;
    fetch(
      resolveApiUrl(
        `/chess/openings/explorer?fen=${encodeURIComponent(fen)}`,
      ),
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) setMoves(data);
        setStatus('done');
      })
      .catch(() => {
        if (!cancelled) setStatus('done');
      });
    return () => {
      cancelled = true;
    };
  }, [fen]);

  if (status === 'loading') {
    return (
      <div className="p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
        <div className="text-[10px] font-semibold text-[var(--textSecondary)] uppercase tracking-wider mb-2">
          Opening Explorer
        </div>
        <div className="text-xs text-[var(--textSecondary)]">
          Loading...
        </div>
      </div>
    );
  }

  if (moves.length === 0) {
    return null;
  }

  return (
    <div className="p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
      <div className="text-[10px] font-semibold text-[var(--textSecondary)] uppercase tracking-wider mb-2">
        Opening Explorer
      </div>

      {moves.map((m) => {
        const total = m.white + m.draws + m.black || 1;
        const whitePct = Math.round((m.white / total) * 100);
        const drawPct = Math.round((m.draws / total) * 100);
        const blackPct = Math.round((m.black / total) * 100);

        return (
          <div key={m.move} className="flex flex-col gap-1 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color)]">
                {m.move}
              </span>
              <span className="text-[10px] text-[var(--textSecondary)]">
                {m.totalGames.toLocaleString()} games
              </span>
            </div>

            {m.opening && (
              <div className="text-[10px] text-[var(--textSecondary)]">
                {m.eco && (
                  <span className="font-mono mr-1">{m.eco}</span>
                )}
                {m.opening}
              </div>
            )}

            <div className="flex h-1.5 rounded overflow-hidden bg-[var(--backgroundHover)]">
              <div
                className="bg-white/60"
                style={{ width: `${whitePct}%` }}
              />
              <div
                className="bg-gray-400/40"
                style={{ width: `${drawPct}%` }}
              />
              <div
                className="bg-gray-800/60"
                style={{ width: `${blackPct}%` }}
              />
            </div>

            <div className="flex justify-between text-[9px] text-[var(--textSecondary)]">
              <span>{whitePct}%</span>
              <span>{drawPct}%</span>
              <span>{blackPct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const OpeningExplorer = memo(OpeningExplorerImpl);
