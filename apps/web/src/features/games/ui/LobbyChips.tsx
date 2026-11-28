'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { LobbyPhase } from './lobbyConfig';

const PHASE_STYLES: Record<LobbyPhase, string> = {
  waiting:
    'border-[var(--warning)]/50 bg-[var(--warning)]/15 text-[var(--textPrimary)]',
  ready:
    'border-[var(--success)]/50 bg-[var(--success)]/15 text-[var(--textPrimary)]',
  inProgress:
    'border-[var(--primary)]/50 bg-[var(--primary)]/15 text-[var(--textPrimary)]',
};

const PHASE_DOT: Record<LobbyPhase, string> = {
  waiting: 'bg-[var(--warning)] motion-safe:animate-pulse',
  ready: 'bg-[var(--success)]',
  inProgress: 'bg-[var(--primary)]',
};

/** Room status chip: waiting for players / ready to start / in progress. */
export function LobbyStatusChip({
  phase,
  className,
}: {
  phase: LobbyPhase;
  className?: string;
}) {
  const { t } = useTranslation();
  const label = {
    waiting: t('games.lobby.statusWaiting'),
    ready: t('games.lobby.statusReady'),
    inProgress: t('games.lobby.statusInProgress'),
  }[phase];
  return (
    <span
      data-testid="lobby-status-chip"
      data-phase={phase}
      className={cx(
        'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
        PHASE_STYLES[phase],
        className,
      )}
    >
      <span
        aria-hidden
        className={cx('h-2 w-2 rounded-full', PHASE_DOT[phase])}
      />
      {label}
    </span>
  );
}

const CHIP =
  'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide';

/** Host / You / Bot chips for a player row. */
export function LobbyMemberChips({
  isRoomHost,
  isBot,
  isYou,
}: {
  isRoomHost: boolean;
  isBot: boolean;
  isYou?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <>
      {isRoomHost && (
        <span
          className={cx(
            CHIP,
            'bg-[var(--primary)]/20 text-[var(--textPrimary)]',
          )}
        >
          {t('games.lobby.hostBadge')}
        </span>
      )}
      {isYou && (
        <span
          className={cx(
            CHIP,
            'bg-[var(--backgroundHover)] text-[var(--textSecondary)]',
          )}
        >
          {t('games.lobby.youBadge')}
        </span>
      )}
      {isBot ? (
        <span
          className={cx(CHIP, 'bg-[var(--info)]/20 text-[var(--textPrimary)]')}
        >
          🤖 {t('games.lobby.botChip')}
        </span>
      ) : (
        <span
          className={cx(
            CHIP,
            'bg-[var(--success)]/20 text-[var(--textPrimary)]',
          )}
        >
          ✓ {t('games.lobby.readyChip')}
        </span>
      )}
    </>
  );
}
