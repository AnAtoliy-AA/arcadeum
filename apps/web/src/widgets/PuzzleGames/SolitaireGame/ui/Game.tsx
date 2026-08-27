'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { Button, LoadingState } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useTrackSoloGameStarted } from '@/shared/analytics/useTrackSoloGameStarted';
import { GameResultModal } from '@/features/games/ui/GameResultModal';
import type { GameResultStats } from '@/features/games/ui/GameResultStatsGrid';
import { SolitaireThemeProvider } from '../lib/SolitaireThemeContext';
import { useSolitaireStore } from '../store/solitaireStore';
import type { MoveSource } from '../types';
import { SolitaireBoard } from './SolitaireBoard';

export default function SolitaireGame() {
  useTrackSoloGameStarted('solitaire_v1');
  return (
    <SolitaireThemeProvider>
      <SolitaireTable />
    </SolitaireThemeProvider>
  );
}

function subscribeNoop(): () => void {
  return () => undefined;
}

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function SolitaireTable() {
  const { t } = useTranslation();
  const game = useSolitaireStore((state) => state.game);
  const finished = useSolitaireStore((state) => state.finished);
  const startedAt = useSolitaireStore((state) => state.startedAt);
  const draw = useSolitaireStore((state) => state.draw);
  const move = useSolitaireStore((state) => state.move);
  const newGame = useSolitaireStore((state) => state.newGame);

  const [selection, setSelection] = useState<MoveSource | null>(null);

  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const [elapsedMs, setElapsedMs] = useState(0);
  const isRunning = mounted && finished === null;
  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = setInterval(
      () => setElapsedMs(Date.now() - startedAt),
      1000,
    );
    return () => clearInterval(interval);
  }, [isRunning, startedAt]);

  const [isDismissed, setIsDismissed] = useState(false);

  const handleCloseModal = useCallback(() => {
    setIsDismissed(true);
  }, []);

  const handleNewGame = useCallback(() => {
    setIsDismissed(false);
    newGame();
  }, [newGame]);

  const handleOpenModal = useCallback(() => {
    setIsDismissed(false);
  }, []);

  const stats: GameResultStats | null = useMemo(() => {
    if (!finished) return null;
    return {
      score: finished.score,
      turns: finished.moves,
      duration: formatDuration(finished.durationMs),
    };
  }, [finished]);

  if (!mounted) {
    return <LoadingState message={t('games.solitaire_v1.board.loading')} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-2">
      <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-slate-950/70 p-3 shadow-xl shadow-black/50 backdrop-blur-md sm:p-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <StatCard
            label={t('games.solitaire_v1.hud.score')}
            value={game.score}
          />
          <StatCard
            label={t('games.solitaire_v1.hud.moves')}
            value={game.moves}
          />
          <StatCard
            label={t('games.solitaire_v1.hud.time')}
            value={formatDuration(elapsedMs)}
          />
        </div>

        <div className="flex items-center gap-2">
          {finished !== null && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenModal}
              data-testid="solitaire-show-results-button"
              className="border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60"
            >
              🏆 {t('games.table.analytics.view') || 'Results'}
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleNewGame}
            data-testid="solitaire-new-game-button"
          >
            {t('games.solitaire_v1.hud.newGame')}
          </Button>
        </div>
      </div>

      <SolitaireBoard
        game={game}
        selection={selection}
        onSelect={setSelection}
        onDraw={draw}
        onMove={move}
      />

      <GameResultModal
        isOpen={finished !== null && !isDismissed}
        result={finished ? (finished.won ? 'victory' : 'defeat') : null}
        gameName="Solitaire"
        onRematch={handleNewGame}
        rematchLabel={t('games.solitaire_v1.result.playAgain')}
        onClose={handleCloseModal}
        t={t}
        messages={{
          title: t(
            finished?.won
              ? 'games.solitaire_v1.result.wonTitle'
              : 'games.solitaire_v1.result.lostTitle',
          ),
          message: t(
            finished?.won
              ? 'games.solitaire_v1.result.wonBody'
              : 'games.solitaire_v1.result.lostBody',
          ),
        }}
        theme="casino"
        stats={stats}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-black/40 px-3 py-1.5 backdrop-blur-sm sm:px-4 sm:py-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className="font-mono text-base font-extrabold tabular-nums text-white sm:text-lg">
        {value}
      </span>
    </div>
  );
}
