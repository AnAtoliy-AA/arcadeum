'use client';

import { useCallback, useState } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import type { TranslationKey } from '@/shared/lib/useTranslation';

interface ReplayShareButtonProps {
  replayId: string;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function ReplayShareButton({ replayId, t }: ReplayShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/replay/${replayId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t('games.replay.share.title'),
          url,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      const timer = window.setTimeout(() => setCopied(false), 2000);
      return () => window.clearTimeout(timer);
    } catch {}
  }, [replayId, t]);

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cx(
        'flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors duration-200',
        copied
          ? 'bg-[var(--success)] text-white'
          : 'bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-[var(--color)] hover:bg-[var(--glassBgHover)]',
      )}
    >
      {copied ? '✓' : '🔗'}
      {copied ? t('games.replay.share.copied') : t('games.replay.share.button')}
    </button>
  );
}
