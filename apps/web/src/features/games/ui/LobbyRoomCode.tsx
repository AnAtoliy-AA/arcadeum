'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';

/** Room code chip with a one-tap copy action (44px touch target). */
export function LobbyRoomCode({ code }: { code: string }) {
  const { t } = useTranslation();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setState('copied');
    } catch {
      setState('failed');
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  }, [code]);

  const label =
    state === 'copied'
      ? t('games.lobby.codeCopied')
      : state === 'failed'
        ? t('games.lobby.copyFailed')
        : t('games.lobby.copyCode');

  return (
    <button
      type="button"
      onClick={copy}
      data-testid="lobby-room-code"
      aria-label={`${t('games.lobby.roomCode')}: ${code}. ${label}`}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-3 text-xs text-[var(--textSecondary)] transition-colors hover:bg-[var(--glassBgHover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)] motion-reduce:transition-none"
    >
      <span className="font-semibold uppercase tracking-wide">
        {t('games.lobby.roomCode')}
      </span>
      <span className="font-mono text-sm font-bold tracking-[2px] text-[var(--textPrimary)]">
        {code}
      </span>
      <span aria-live="polite" className="font-semibold text-[var(--primary)]">
        {state === 'idle' ? '⧉' : label}
      </span>
    </button>
  );
}
