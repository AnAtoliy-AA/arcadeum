import Link from 'next/link';
import { GlassCard, Button } from '@arcadeum/ui';
import { EventPrizeBadge } from './EventPrizeBadge';
import type { GameNightEvent } from '../model/types';
import { buildRoutes, type Locale } from '@/shared/config/routes';

export interface EventCardTranslations {
  liveBadge?: string;
  upcomingBadge?: string;
  completedBadge?: string;
  cancelledBadge?: string;
  participants?: string;
  activeGames?: string;
  startsIn?: string;
  endsIn?: string;
  playNow?: string;
  joinEvent?: string;
  mvp?: string;
  [key: string]: string | undefined;
}

export const EventCard = ({
  event,
  locale = 'en',
  translations = {},
}: {
  event: GameNightEvent;
  locale?: string;
  translations?: EventCardTranslations;
}) => {
  const routes = buildRoutes(locale as Locale);
  const detailUrl = routes.eventDetail
    ? routes.eventDetail(event.id)
    : `/${locale}/events/${event.id}`;

  const getStatusBadge = () => {
    switch (event.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--danger)]/15 text-[var(--danger)] border border-[var(--danger)]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] animate-pulse" />
            {translations.liveBadge ?? 'LIVE NOW'}
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30">
            {translations.upcomingBadge ?? 'UPCOMING'}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--surfaceHover)] text-[var(--textSecondary)] border border-[var(--glassBorder)]">
            {translations.completedBadge ?? 'COMPLETED'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--surfaceHover)] text-[var(--textSecondary)] border border-[var(--glassBorder)]">
            {translations.cancelledBadge ?? 'CANCELLED'}
          </span>
        );
    }
  };

  const formattedDate = new Date(event.startTime).toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <GlassCard
      className="flex flex-col justify-between p-5 rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] hover:border-[var(--primary)]/40 transition-all duration-300 gap-4"
      data-testid={`event-card-${event.id}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          {getStatusBadge()}
          <span className="text-xs font-medium text-[var(--textSecondary)] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--glassBorder)]">
            {event.gameType}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-color line-clamp-1">
            {event.title}
          </h3>
          <p className="text-sm text-[var(--textSecondary)] mt-1 line-clamp-2">
            {event.description}
          </p>
        </div>

        {event.prizeBadge && (
          <div>
            <EventPrizeBadge badgeId={event.prizeBadge} variant="chip" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--glassBorder)] pt-3">
        <div className="flex items-center justify-between text-xs text-[var(--textSecondary)]">
          <span>{formattedDate}</span>
          <span className="font-semibold text-color">
            {event.participantCount}{' '}
            {translations.participants ?? 'participants'}
          </span>
        </div>

        {event.status === 'active' && event.activeGamesCount > 0 && (
          <div className="flex items-center justify-between text-xs text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-lg">
            <span>{translations.activeGames ?? 'active games'}</span>
            <span className="font-bold">{event.activeGamesCount}</span>
          </div>
        )}

        {event.status === 'completed' && event.mvpDisplayName && (
          <div className="flex items-center justify-between text-xs text-[var(--gold)] bg-[var(--gold)]/10 px-2.5 py-1 rounded-lg">
            <span>{translations.mvp ?? 'Event MVP'}</span>
            <span className="font-bold">{event.mvpDisplayName}</span>
          </div>
        )}

        <Link href={detailUrl} className="w-full">
          <Button
            variant={event.status === 'active' ? 'primary' : 'secondary'}
            className="w-full justify-center text-sm py-2"
          >
            {event.status === 'active'
              ? (translations.playNow ?? 'Play Now')
              : (translations.joinEvent ?? 'View Details')}
          </Button>
        </Link>
      </div>
    </GlassCard>
  );
};
