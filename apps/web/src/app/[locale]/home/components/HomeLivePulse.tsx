'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import { useLiveStatsStore } from '@/features/live-stats';
import { LivePulseCard, LivePulseLinkAction } from './LivePulseCard';
import { LivePulsePickerButton } from './LivePulsePickerButton';

export function HomeLivePulse() {
  const { t } = useTranslation();
  const routes = useRoutes();
  const { stats, fetchLiveStats, lastFetchedAt } = useLiveStatsStore();
  // Until the first response arrives zeros are unknown, not real zeros.
  const known = lastFetchedAt !== null;
  const fmt = (v: string) => (known ? v : '-');
  const noOnline = known && stats.onlineUsers === 0;
  const noActive = known && stats.activeGames === 0;
  const noLobbies = known && stats.waitingRooms === 0;
  const noSeeking = known && stats.waitingPlayers === 0;
  const noToday = known && stats.matchesToday === 0;

  useEffect(() => {
    void fetchLiveStats();
  }, [fetchLiveStats]);

  return (
    <section
      data-testid="home-live-pulse-section"
      aria-labelledby="live-pulse-heading"
      className="relative z-[2] mx-auto my-8 w-full max-w-[1400px] px-4"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.36)] backdrop-blur-2xl md:p-8">
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        <div className="relative z-[1] mb-6 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-emerald-400 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>{t('home.liveBadgeOnline')}</span>
            </div>
            <h2
              id="live-pulse-heading"
              className="text-xl font-extrabold tracking-tight text-white md:text-3xl"
            >
              {t('home.liveTitle')}
            </h2>
            <p className="mt-0.5 text-xs text-white/75 md:text-sm">
              {t('home.liveSubtitle')}
            </p>
          </div>

          <Link
            href={routes.rooms}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white shadow-sm backdrop-blur-md transition-all hover:border-emerald-400/40 hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{t('home.liveViewAllRooms')}</span>
            <span className="text-emerald-400">→</span>
          </Link>
        </div>

        <div className="relative z-[1] grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-5 md:gap-4">
          <LivePulseCard
            tone="emerald"
            testId="live-online-card"
            counterTestId="live-online-counter"
            label={t('home.liveBadgeOnline')}
            icon="👥"
            value={fmt(stats.onlineUsers.toLocaleString())}
            description={
              !known
                ? t('home.liveStatsUnknown')
                : noOnline
                  ? t('home.liveOnlineEmpty')
                  : t('home.liveOnlineSub')
            }
            empty={noOnline}
          >
            {noOnline || !known ? (
              <LivePulsePickerButton
                tone="emerald"
                testId="live-online-action"
                label={t('home.livePlayBotAction')}
              />
            ) : (
              <LivePulseLinkAction
                tone="emerald"
                testId="live-online-action"
                href={routes.games}
              >
                {t('home.liveBrowseGamesAction')}
              </LivePulseLinkAction>
            )}
          </LivePulseCard>

          <LivePulseCard
            tone="amber"
            testId="live-active-games-card"
            counterTestId="live-active-games-counter"
            label={t('home.liveBadgeActiveGames')}
            icon="⚔️"
            value={fmt(String(stats.activeGames))}
            description={
              noActive ? t('home.liveActiveEmpty') : t('home.liveActiveSub')
            }
            empty={noActive}
          >
            <LivePulseLinkAction
              tone="amber"
              testId="live-active-games-action"
              href={
                noActive || !known
                  ? routes.games
                  : `${routes.rooms}?status=in_progress`
              }
            >
              {noActive || !known
                ? t('home.liveBrowseGamesAction')
                : t('home.liveActiveAction')}
            </LivePulseLinkAction>
          </LivePulseCard>

          <LivePulseCard
            tone="indigo"
            testId="live-waiting-rooms-card"
            counterTestId="live-waiting-rooms-counter"
            label={t('home.liveBadgeWaitingRooms')}
            icon="🎮"
            value={fmt(String(stats.waitingRooms))}
            description={
              noLobbies
                ? t('home.liveLobbiesEmpty')
                : t('home.liveWaitingRoomsSub')
            }
            empty={noLobbies}
          >
            {noLobbies || !known ? (
              <>
                <LivePulseLinkAction
                  tone="indigo"
                  testId="live-waiting-rooms-action"
                  href={routes.gameCreate}
                >
                  {t('home.liveCreateRoomAction')}
                </LivePulseLinkAction>
                <LivePulsePickerButton
                  tone="indigo"
                  testId="live-waiting-rooms-bot-action"
                  label={t('home.livePlayBotAction')}
                />
              </>
            ) : (
              <LivePulseLinkAction
                tone="indigo"
                testId="live-waiting-rooms-action"
                href={`${routes.rooms}?status=lobby`}
              >
                {t('home.liveLobbiesAction')}
              </LivePulseLinkAction>
            )}
          </LivePulseCard>

          <LivePulseCard
            tone="fuchsia"
            testId="live-waiting-players-card"
            counterTestId="live-waiting-players-counter"
            label={t('home.liveBadgeWaitingPlayers')}
            icon="🎯"
            value={fmt(String(stats.waitingPlayers))}
            description={
              noSeeking ? t('home.liveSeekingEmpty') : t('home.liveSeekingSub')
            }
            empty={noSeeking}
          >
            <LivePulsePickerButton
              tone="fuchsia"
              testId="live-waiting-players-action"
              label={t('home.liveQuickMatchAction')}
            />
          </LivePulseCard>

          <LivePulseCard
            tone="cyan"
            testId="live-matches-today-card"
            counterTestId="live-matches-today-counter"
            label={t('home.liveBadgeMatchesToday')}
            icon="🏆"
            value={fmt(stats.matchesToday.toLocaleString())}
            description={
              noToday ? t('home.liveTodayEmpty') : t('home.liveTodaySub')
            }
            empty={noToday}
            className="min-[480px]:col-span-2 lg:col-span-1"
          >
            <LivePulseLinkAction
              tone="cyan"
              testId="live-matches-today-action"
              href={
                noToday || !known
                  ? routes.games
                  : `${routes.rooms}?status=completed`
              }
            >
              {noToday || !known
                ? t('home.liveBrowseGamesAction')
                : t('home.liveTodayAction')}
            </LivePulseLinkAction>
          </LivePulseCard>
        </div>
      </div>
    </section>
  );
}
