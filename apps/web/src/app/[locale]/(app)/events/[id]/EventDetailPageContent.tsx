'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { Container, Button, GlassCard } from '@arcadeum/ui';
import { useEventsStore, EventLeaderboard } from '@/features/events';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { buildRoutes, type Locale } from '@/shared/config/routes';

interface EventDetailTranslations {
  title?: string;
  backToEvents?: string;
  liveBadge?: string;
  upcomingBadge?: string;
  completedBadge?: string;
  cancelledBadge?: string;
  joinEvent?: string;
  joined?: string;
  joining?: string;
  playNow?: string;
  loginPrompt?: string;
  rulesTitle?: string;
  rulesDescription?: string;
  prizeBadge?: string;
  badgeEarned?: string;
  participants?: string;
  activeGames?: string;
  eventNotFound?: string;
  mvp?: string;
  [key: string]: string | undefined;
}

export default function EventDetailPageContent({
  id,
  t: tProp,
  locale = 'en',
  accessToken,
}: {
  id: string;
  t?: Record<string, string>;
  locale?: string;
  accessToken?: string;
}) {
  const tt = useMemo(() => (tProp ?? {}) as EventDetailTranslations, [tProp]);
  const { snapshot } = useSessionTokens();
  const token = snapshot.accessToken ?? accessToken;
  const routes = buildRoutes(locale as Locale);
  const { currentEvent, fetchEventById, joinEvent, loading } = useEventsStore();
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchEventById(id, token);
  }, [id, token, fetchEventById]);

  const isRegistered = useMemo(() => {
    if (!currentEvent || !snapshot.userId) return false;
    return currentEvent.participants.some((p) => p.userId === snapshot.userId);
  }, [currentEvent, snapshot.userId]);

  const handleJoin = useCallback(async () => {
    if (!token || isJoining) return;
    setIsJoining(true);
    try {
      await joinEvent(id, token);
    } catch {
      // error handled in store
    } finally {
      setIsJoining(false);
    }
  }, [id, token, isJoining, joinEvent]);

  if (!currentEvent && !loading) {
    return (
      <Container className="py-16 flex flex-col items-center justify-center gap-4 text-center max-w-4xl">
        <h1 className="text-2xl font-bold text-color">
          {tt.eventNotFound ?? 'Event not found'}
        </h1>
        <Link href={routes.events}>
          <Button variant="secondary">
            {tt.backToEvents ?? 'Back to Events'}
          </Button>
        </Link>
      </Container>
    );
  }

  if (!currentEvent) return null;

  const isLive = currentEvent.status === 'active';
  const gameRoute = routes.gameDetail
    ? routes.gameDetail(currentEvent.gameType)
    : `/${locale}/games/${currentEvent.gameType}`;

  const formattedStart = new Date(currentEvent.startTime).toLocaleString(
    locale,
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  );
  const formattedEnd = new Date(currentEvent.endTime).toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Container
      className="py-8 md:py-12 flex flex-col gap-8 max-w-5xl"
      data-testid="event-detail-page"
    >
      <div>
        <Link
          href={routes.events}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--textSecondary)] hover:text-[var(--primary)] transition-colors mb-4"
        >
          ← {tt.backToEvents ?? 'Back to Events'}
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-6 md:p-8 backdrop-blur-xl shadow-xl flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--errorBgSoft)] text-[var(--danger)] border border-[var(--errorBorder)] animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[var(--danger)]" />
                  {tt.liveBadge ?? 'LIVE NOW'}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/40">
                  {currentEvent.status === 'upcoming'
                    ? (tt.upcomingBadge ?? 'UPCOMING')
                    : currentEvent.status === 'completed'
                      ? (tt.completedBadge ?? 'COMPLETED')
                      : (tt.cancelledBadge ?? 'CANCELLED')}
                </span>
              )}
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[var(--surface)] text-[var(--textSecondary)] border border-[var(--glassBorder)]">
                {currentEvent.gameType}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-color tracking-tight">
              {currentEvent.title}
            </h1>
            <p className="text-sm md:text-base text-[var(--textSecondary)] max-w-2xl">
              {currentEvent.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            {isLive ? (
              <Link href={gameRoute} className="w-full">
                <Button
                  variant="primary"
                  className="w-full justify-center py-3 text-base font-bold shadow-lg shadow-[var(--primary)]/25"
                  data-testid="event-play-now-button"
                >
                  {tt.playNow ?? 'Play Now'} 🎮
                </Button>
              </Link>
            ) : null}

            {snapshot.userId ? (
              <Button
                variant={isRegistered ? 'secondary' : 'primary'}
                disabled={isRegistered || isJoining}
                onClick={handleJoin}
                className="w-full justify-center py-2.5 text-sm font-semibold"
                data-testid="event-join-button"
              >
                {isJoining
                  ? (tt.joining ?? 'Joining...')
                  : isRegistered
                    ? `✓ ${tt.joined ?? 'Registered'}`
                    : (tt.joinEvent ?? 'Join Event')}
              </Button>
            ) : (
              <Link href={routes.auth} className="w-full">
                <Button
                  variant="secondary"
                  className="w-full justify-center py-2.5 text-xs text-center"
                >
                  {tt.loginPrompt ?? 'Log in to join'}
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-[var(--glassBorder)] pt-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[var(--textSecondary)]">
              Time Window
            </span>
            <span className="text-xs md:text-sm font-semibold text-color">
              {formattedStart} – {formattedEnd}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-[var(--textSecondary)]">
              Participants
            </span>
            <span className="text-xs md:text-sm font-semibold text-color">
              {currentEvent.participantCount} {tt.participants ?? 'players'}
            </span>
          </div>

          {currentEvent.prizeBadge && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[var(--textSecondary)]">
                {tt.prizeBadge ?? 'Reward'}
              </span>
              <span className="text-xs md:text-sm font-semibold text-[var(--gold)]">
                ★ {currentEvent.prizeBadge}
              </span>
            </div>
          )}

          {currentEvent.mvpDisplayName && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[var(--textSecondary)]">
                {tt.mvp ?? 'Event MVP'}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs md:text-sm font-bold text-color">
                  {currentEvent.mvpDisplayName}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]/40">
                  MVP
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <EventLeaderboard
            participants={currentEvent.leaderboard}
            mvpUserId={currentEvent.mvpUserId}
            translations={tt}
          />
        </div>

        <div className="flex flex-col gap-6">
          <GlassCard className="p-5 md:p-6 rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] flex flex-col gap-3">
            <h3 className="text-base font-bold text-color">
              {tt.rulesTitle ?? 'Event Rules'}
            </h3>
            <p className="text-xs text-[var(--textSecondary)] leading-relaxed">
              {tt.rulesDescription ??
                'Queue for the featured game during the event window. Each match win awards 3 points, participation awards 1 point.'}
            </p>
            <div className="mt-2 p-3 rounded-xl bg-[var(--surface)] border border-[var(--glassBorder)] text-xs font-medium text-[var(--accent)]">
              {tt.badgeEarned ?? 'Reward: Exclusive Profile Badge'}
            </div>
          </GlassCard>
        </div>
      </div>
    </Container>
  );
}
