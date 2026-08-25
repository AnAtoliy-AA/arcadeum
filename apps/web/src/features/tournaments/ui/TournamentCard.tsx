'use client';
import Link from 'next/link';
import { Button, GlassCard } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import { formatDateTime, formatNumber } from '@/shared/i18n/formatters';
import {
  type EffectiveTournamentStatus,
  type PublicTournamentItem,
} from '../api';
import type { TournamentGameType } from '@/features/admin-tournaments/api';

export interface TournamentCardLabels {
  registered: string;
  prize: string;
  entryFee: string;
  prizePool: string;
  registerCta: string;
  unregisterCta: string;
  signInToRegister: string;
  full: string;
  registrationClosed: string;
  viewBracket: string;
  confirmRegister: {
    title: string;
    body: string;
    confirm: string;
    cancel: string;
  };
  confirmUnregister: {
    refund: string;
    title: string;
    body: string;
    confirm: string;
    cancelButton: string;
  };
  errors: { insufficientFunds: string };
  effectiveStatus: Record<EffectiveTournamentStatus, string>;
  gameType: Record<TournamentGameType, string>;
}

export interface TournamentCardProps {
  item: PublicTournamentItem;
  isAuthenticated: boolean;
  isPending?: boolean;
  onRegister: (id: string) => void;
  onUnregister: (id: string) => void;
  labels: TournamentCardLabels;
}

const STATUS_BG: Record<EffectiveTournamentStatus, string> = {
  scheduled: '#1c1d21',
  registration_open: 'rgba(99,102,241,0.1)',
  registration_closed: '#26272b',
  live: 'rgba(16,185,129,0.2)',
  awaiting_results: 'rgba(251,191,36,0.2)',
  completed: '#26272b',
  cancelled: 'rgba(239,68,68,0.25)',
};

export { STATUS_BG };

export function TournamentCard({
  item,
  isAuthenticated,
  isPending,
  onRegister,
  onUnregister,
  labels,
}: TournamentCardProps) {
  const { locale } = useLanguage();
  const isFull = item.registeredCount >= item.maxPlayers;
  const canRegister = item.effectiveStatus === 'registration_open';

  let cta: React.ReactNode = null;
  if (
    item.effectiveStatus === 'cancelled' ||
    item.effectiveStatus === 'completed'
  ) {
    cta = null;
  } else if (!isAuthenticated) {
    cta = (
      <span className="text-[12px] opacity-[0.7]">
        {labels.signInToRegister}
      </span>
    );
  } else if (item.isRegistered) {
    cta = (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onUnregister(item.id)}
        disabled={isPending}
        data-testid={`unregister-${item.id}`}
      >
        {labels.unregisterCta}
      </Button>
    );
  } else if (canRegister) {
    cta = (
      <Button
        size="sm"
        onClick={() => onRegister(item.id)}
        disabled={isPending}
        data-testid={`register-${item.id}`}
      >
        {isFull ? labels.full : labels.registerCta}
      </Button>
    );
  } else {
    cta = (
      <span className="text-[12px] opacity-[0.7]">
        {labels.registrationClosed}
      </span>
    );
  }

  return (
    <GlassCard
      className={'p-4 gap-3'}
      data-testid={`tournament-card-${item.id}`}
    >
      <div className="flex flex-row items-start justify-between gap-2">
        <div className="flex flex-col items-stretch flex-1 gap-1">
          <span className="text-[20px] font-bold">{item.name}</span>
          <span className="text-[12px] opacity-[0.7]">
            {labels.gameType[item.gameType]} ·{' '}
            {formatDateTime(item.scheduledAt, locale, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div
          className="flex flex-row items-stretch px-2 py-1 rounded-lg"
          style={{
            backgroundColor: STATUS_BG[item.effectiveStatus],
          }}
        >
          <span className="text-[12px] font-bold">
            {labels.effectiveStatus[item.effectiveStatus]}
          </span>
        </div>
      </div>

      {item.description && (
        <span className="text-[14px] opacity-[0.85]">{item.description}</span>
      )}

      {item.prizeDescription && (
        <span className="text-[14px]">
          <span className="font-bold">{labels.prize}:</span>{' '}
          {item.prizeDescription}
        </span>
      )}

      {(item.entryFeeCoins > 0 || item.prizePoolCoins > 0) && (
        <div className="flex flex-row items-stretch gap-3 flex-wrap">
          {item.entryFeeCoins > 0 && (
            <span className="text-[14px]" data-testid={`entry-fee-${item.id}`}>
              <span className="font-bold">{labels.entryFee}:</span>{' '}
              {formatNumber(item.entryFeeCoins, locale)}
            </span>
          )}
          {item.prizePoolCoins > 0 && (
            <span className="text-[14px]" data-testid={`prize-pool-${item.id}`}>
              <span className="font-bold">{labels.prizePool}:</span>{' '}
              {formatNumber(item.prizePoolCoins, locale)}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-row items-center justify-between gap-2">
        <span className="text-[12px] opacity-[0.7]">
          {labels.registered
            .replace('{count}', String(item.registeredCount))
            .replace('{max}', String(item.maxPlayers))}
          {item.waitlistCount > 0 ? ` (+${item.waitlistCount})` : ''}
        </span>
        {cta}
      </div>

      <Link
        href={`/tournaments/${encodeURIComponent(item.id)}`}
        className="self-start text-[12px] font-bold text-[var(--primary)] underline-offset-2 hover:underline"
        data-testid={`view-bracket-${item.id}`}
      >
        {labels.viewBracket} →
      </Link>
    </GlassCard>
  );
}
