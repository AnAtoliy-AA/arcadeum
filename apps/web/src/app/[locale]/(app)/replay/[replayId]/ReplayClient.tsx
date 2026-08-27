'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useReplayStore } from '@/features/replay/store/replayStore';
import { replayApi } from '@/features/replay/api';
import { ReplayHeader } from '@/features/replay/ui/ReplayHeader';
import { ReplayBoard } from '@/features/replay/ui/ReplayBoard';
import { ReplayControls } from '@/features/replay/ui/ReplayControls';
import { ReplayShareButton } from '@/features/replay/ui/ReplayShareButton';
import type { ReplayDetail } from '@/features/replay/lib/types';

interface ReplayClientProps {
  initialReplay: ReplayDetail | null;
  replayId: string;
}

export default function ReplayClient({
  initialReplay,
  replayId,
}: ReplayClientProps) {
  const { t } = useTranslation();
  const replay = useReplayStore((s) => s.replay);
  const loadReplay = useReplayStore((s) => s.loadReplay);
  const loading = useReplayStore((s) => s.loading);
  const error = useReplayStore((s) => s.error);
  const reset = useReplayStore((s) => s.reset);

  useEffect(() => {
    if (initialReplay) {
      loadReplay(initialReplay);
      return;
    }

    let cancelled = false;
    const fetchReplay = async () => {
      try {
        const data = await replayApi.getReplay(replayId);
        if (!cancelled) {
          loadReplay(data);
        }
      } catch {
        if (!cancelled) {
          useReplayStore.setState({
            error: t('games.replay.error'),
            loading: false,
          });
        }
      }
    };

    useReplayStore.setState({ loading: true });
    fetchReplay();

    return () => {
      cancelled = true;
      reset();
    };
  }, [initialReplay, replayId, loadReplay, reset, t]);

  if (loading) {
    return (
      <div
        data-testid="replay-loading"
        className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 p-4 py-16"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        <p className="text-[14px] text-[rgba(255,255,255,0.5)]">
          {t('games.replay.loading')}
        </p>
      </div>
    );
  }

  if (error || !replay) {
    return (
      <div
        data-testid="replay-error"
        className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 p-4 py-16"
      >
        <span className="text-[48px]">🎬</span>
        <p className="text-center text-[14px] text-[rgba(255,255,255,0.5)]">
          {error || t('games.replay.error')}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4">
      <div className="flex items-start justify-between gap-3">
        <ReplayHeader replay={replay} t={t} />
        <ReplayShareButton replayId={replay.replayId} t={t} />
      </div>

      <div className="flex justify-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6">
        <ReplayBoard replay={replay} />
      </div>

      <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
        <ReplayControls t={t} />
      </div>
    </div>
  );
}
