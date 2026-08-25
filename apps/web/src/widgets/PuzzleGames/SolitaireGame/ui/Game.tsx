'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Button, LoadingState, Modal } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useTrackSoloGameStarted } from '@/shared/analytics/useTrackSoloGameStarted';
import { SolitaireThemeProvider } from '../lib/SolitaireThemeContext';
import {
  useSolitaireStore,
  type FinishedGameInfo,
} from '../store/solitaireStore';
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

  // The board is random and persisted, so it can only render after mount —
  // otherwise SSR markup (fresh deal on the server) never matches the client.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  // Elapsed timer; only ticks while the game is running.
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

  if (!mounted) {
    return <LoadingState message={t('games.solitaire_v1.board.loading')} />;
  }

  return (
    <div
      className="mx-auto w-full max-w-3xl rounded-3xl p-3 sm:p-6"
      style={{ background: 'transparent' }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-4 text-sm">
          <Stat label={t('games.solitaire_v1.hud.score')} value={game.score} />
          <Stat label={t('games.solitaire_v1.hud.moves')} value={game.moves} />
          <Stat
            label={t('games.solitaire_v1.hud.time')}
            value={formatDuration(elapsedMs)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={newGame}>
          {t('games.solitaire_v1.hud.newGame')}
        </Button>
      </div>

      <SolitaireBoard
        game={game}
        selection={selection}
        onSelect={setSelection}
        onDraw={draw}
        onMove={move}
      />

      <ResultDialog finished={finished} onNewGame={newGame} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide opacity-60">
        {label}
      </span>
      <span className="font-mono text-lg font-bold leading-tight">{value}</span>
    </span>
  );
}

function ResultDialog({
  finished,
  onNewGame,
}: {
  finished: FinishedGameInfo | null;
  onNewGame: () => void;
}) {
  const { t } = useTranslation();
  if (!finished) return null;

  const titleKey = finished.won
    ? 'games.solitaire_v1.result.wonTitle'
    : 'games.solitaire_v1.result.lostTitle';

  return (
    <Modal open onClose={() => undefined}>
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <h2 className="text-2xl font-black">{t(titleKey)}</h2>
        <p className="text-sm opacity-80">
          {t(
            finished.won
              ? 'games.solitaire_v1.result.wonBody'
              : 'games.solitaire_v1.result.lostBody',
          )}
        </p>
        <dl className="flex gap-6 text-sm">
          <div>
            <dt className="opacity-60">{t('games.solitaire_v1.hud.score')}</dt>
            <dd className="font-mono text-lg">{finished.score}</dd>
          </div>
          <div>
            <dt className="opacity-60">{t('games.solitaire_v1.hud.moves')}</dt>
            <dd className="font-mono text-lg">{finished.moves}</dd>
          </div>
          <div>
            <dt className="opacity-60">{t('games.solitaire_v1.hud.time')}</dt>
            <dd className="font-mono text-lg">
              {formatDuration(finished.durationMs)}
            </dd>
          </div>
        </dl>
        <Button onClick={onNewGame}>
          {t('games.solitaire_v1.result.playAgain')}
        </Button>
      </div>
    </Modal>
  );
}
