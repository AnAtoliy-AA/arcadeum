'use client';

import { memo } from 'react';
import type { TranslationKey } from '@/shared/i18n/useTranslation';
import { formatMoveRef } from '../lib/move-ref';

interface HistoryViewBannerProps {
  /** -1 for the start position, otherwise the 0-based move index. */
  viewIndex: number | null;
  sanAt?: string;
  onGoLive: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

/** Overlay shown on the board while an earlier position is displayed. */
function HistoryViewBannerImpl({
  viewIndex,
  sanAt,
  onGoLive,
  t,
}: HistoryViewBannerProps) {
  if (viewIndex === null) return null;
  const label =
    viewIndex < 0
      ? t('games.chess_v1.moveList.viewingStart')
      : t('games.chess_v1.moveList.viewing', {
          move: formatMoveRef(viewIndex, sanAt ?? ''),
        });
  return (
    <div
      role="status"
      data-testid="chess-history-banner"
      className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 max-w-[calc(100%-1rem)] px-3 py-1 rounded-full bg-black/70 border border-white/15 backdrop-blur-md shadow-lg text-white text-xs font-semibold"
    >
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onGoLive}
        className="shrink-0 min-h-6 px-2 rounded-full bg-[var(--primary)] text-white text-[11px] font-bold cursor-pointer hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {t('games.chess_v1.moveList.backToLive')}
      </button>
    </div>
  );
}

export const HistoryViewBanner = memo(HistoryViewBannerImpl);
