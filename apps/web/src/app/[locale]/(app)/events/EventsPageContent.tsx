'use client';

import { useEffect, useMemo, useState } from 'react';
import { Container, PageTitle, EmptyState } from '@arcadeum/ui';
import {
  useEventsStore,
  EventCard,
  type EventCardTranslations,
} from '@/features/events';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

interface EventsTranslations extends EventCardTranslations {
  title?: string;
  subtitle?: string;
  activeNow?: string;
  upcoming?: string;
  pastEvents?: string;
  noUpcomingEvents?: string;
  [key: string]: string | undefined;
}

export default function EventsPageContent({
  t: tProp,
  locale = 'en',
  accessToken,
}: {
  t?: Record<string, string>;
  locale?: string;
  accessToken?: string;
}) {
  const tt = useMemo(() => (tProp ?? {}) as EventsTranslations, [tProp]);
  const { snapshot } = useSessionTokens();
  const token = snapshot.accessToken ?? accessToken;
  const { events, fetchEvents, loading } = useEventsStore();
  const [activeTab, setActiveTab] = useState<
    'all' | 'active' | 'upcoming' | 'completed'
  >('all');

  useEffect(() => {
    fetchEvents(undefined, token);
  }, [fetchEvents, token]);

  const activeEvents = useMemo(
    () => events.filter((e) => e.status === 'active'),
    [events],
  );
  const upcomingEvents = useMemo(
    () => events.filter((e) => e.status === 'upcoming'),
    [events],
  );
  const pastEvents = useMemo(
    () => events.filter((e) => e.status === 'completed'),
    [events],
  );

  const displayedEvents = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return activeEvents;
      case 'upcoming':
        return upcomingEvents;
      case 'completed':
        return pastEvents;
      default:
        return events;
    }
  }, [activeTab, activeEvents, upcomingEvents, pastEvents, events]);

  return (
    <Container className="py-8 md:py-12 flex flex-col gap-8 max-w-7xl">
      <div className="flex flex-col gap-2">
        <PageTitle>{tt.title ?? 'Community Game Nights'}</PageTitle>
        <p className="text-sm md:text-base text-[var(--textMuted)]">
          {tt.subtitle ??
            'Join scheduled community tournaments, compete in featured games, and claim exclusive cosmetic badges.'}
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-[var(--glassBorder)] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'all'
              ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20'
              : 'text-[var(--textMuted)] hover:text-[var(--text)] hover:bg-[var(--surfaceHover)]'
          }`}
        >
          All ({events.length})
        </button>

        {activeEvents.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'active'
                ? 'bg-[var(--danger)] text-white shadow-md shadow-[var(--danger)]/20'
                : 'text-[var(--danger)] hover:bg-[var(--danger)]/10'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {tt.activeNow ?? 'Active Now'} ({activeEvents.length})
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'upcoming'
              ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20'
              : 'text-[var(--textMuted)] hover:text-[var(--text)] hover:bg-[var(--surfaceHover)]'
          }`}
        >
          {tt.upcoming ?? 'Upcoming'} ({upcomingEvents.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'completed'
              ? 'bg-[var(--surfaceHover)] text-[var(--text)]'
              : 'text-[var(--textMuted)] hover:text-[var(--text)] hover:bg-[var(--surfaceHover)]'
          }`}
        >
          {tt.pastEvents ?? 'Past'} ({pastEvents.length})
        </button>
      </div>

      {displayedEvents.length === 0 && !loading ? (
        <div className="py-16">
          <EmptyState
            message={
              tt.noUpcomingEvents ??
              'No upcoming game nights scheduled at the moment. Check back soon!'
            }
          />
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="events-grid"
        >
          {displayedEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              locale={locale}
              translations={tt}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
