'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PageTranslations } from '@/shared/i18n/page-translations';
import { useLanguage } from '@/shared/i18n/context';
import {
  connectLeaderboardSocket,
  useLeaderboardSocket,
} from '@/shared/lib/socket';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  PageLayout,
  Container,
  YStack,
  XStack,
  Button,
  EmptyState,
  ErrorState,
  HeroBackdrop,
  EventTicker,
  MythicSpotlight,
  RunnerUpCard,
} from '@arcadeum/ui';
import { Text, View } from 'tamagui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import { useLeaderboard } from '@/entities/leaderboard/model/useLeaderboard';
import type {
  GameMode,
  LeaderboardPlayer,
  LeaderboardSnapshot,
} from '@/entities/leaderboard/model/types';

import { CupCountdown } from './_components/CupCountdown';
import { GameModeTabs } from './_components/GameModeTabs';
import { ClimbersFallersRail } from './_components/ClimbersFallersRail';
import { SquadStrip } from './_components/SquadStrip';
import { RegionStrip } from './_components/RegionStrip';
import { RewardLadder } from './_components/RewardLadder';
import { RankTable } from './_components/RankTable';
import { PinnedSelfRow } from './_components/PinnedSelfRow';
import {
  LeaderboardControls,
  type Scope,
  type Range,
} from './_components/LeaderboardControls';
import { FreshnessIndicator } from './_components/FreshnessIndicator';

const PAGE_SIZE = 50;
const SELF_ROW_FALLBACK_HEIGHT = 88;
const SELF_ROW_PADDING = 32;
const HEADER_OFFSET = 80;

interface LeaderboardsPageContentProps {
  t?: PageTranslations;
  selfId?: string;
  accessToken?: string;
}

export default function LeaderboardsPageContent({
  t: initialT,
  selfId,
  accessToken,
}: LeaderboardsPageContentProps) {
  const router = useRouter();
  const { messages } = useLanguage();
  const t =
    (messages.pages?.leaderboards as unknown as PageTranslations) || initialT;
  const [mode, setMode] = useState<GameMode>('all');
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<LeaderboardPlayer[]>([]);
  const [scope, setScope] = useState<Scope>('global');
  const [range, setRange] = useState<Range>('week');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selfRowHeight, setSelfRowHeight] = useState(SELF_ROW_FALLBACK_HEIGHT);

  // Bug #7: merge keyed off the snapshot's own page so we never depend on
  // the latest React `page` state — async fetches can resolve out of order.
  const handleLoaded = useCallback((snapshot: LeaderboardSnapshot) => {
    setAccumulated((prev) =>
      snapshot.page === 1 ? snapshot.rows : [...prev, ...snapshot.rows],
    );
  }, []);

  const { data, isLoading, error, refetch } = useLeaderboard({
    mode,
    selfId,
    accessToken,
    page,
    pageSize: PAGE_SIZE,
    q: debouncedSearch,
    scope,
    range,
    onSuccess: handleLoaded,
  });

  // Single reset path for every filter change. setPage(1) inside a
  // user-event handler is lint-clean; for `debouncedSearch` we still need
  // an effect, so we synchronously reset before the next snapshot lands.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    setAccumulated([]);
  }, [debouncedSearch]);

  // Skip socket setup when running against the mock — there's no BE gateway
  // to talk to and the connection retries pollute the dev console.
  const realtimeEnabled =
    process.env.NEXT_PUBLIC_E2E !== 'true' &&
    process.env.NEXT_PUBLIC_USE_LEADERBOARD_MOCK !== 'true';

  // Page-scoped: only the leaderboards namespace socket connects on this
  // route, and it tears down on unmount so background pings don't follow
  // the user to other pages.
  useEffect(() => {
    if (!realtimeEnabled) return;
    return connectLeaderboardSocket(accessToken ?? null);
  }, [accessToken, realtimeEnabled]);

  // Bug #6: stable handlers via useCallback so the socket subscription
  // doesn't re-bind on every render.
  const [freshnessPulseKey, setFreshnessPulseKey] = useState(0);
  const handleCaptured = useCallback(() => {
    setFreshnessPulseKey((k) => k + 1);
    if (page === 1) {
      refetch().catch((err: unknown) => {
        // #20: don't swallow silently. Until we wire telemetry this at
        // least surfaces a flapping BE in the dev console.
        console.warn('[leaderboards] refetch on capture failed', err);
      });
    }
  }, [page, refetch]);
  useLeaderboardSocket('leaderboards.captured', handleCaptured);

  const handleEntryUpdated = useCallback(
    (...args: unknown[]) => {
      const update = args[0] as
        | {
            userId?: string;
            mode?: GameMode;
            isInMatch?: boolean;
            rating?: number;
          }
        | undefined;
      if (!update?.userId) return;
      if (update.mode && update.mode !== mode) return;
      setAccumulated((prev) =>
        prev.map((p) =>
          p.id === update.userId
            ? {
                ...p,
                isInMatch: update.isInMatch ?? p.isInMatch,
                rating: update.rating ?? p.rating,
              }
            : p,
        ),
      );
    },
    [mode],
  );
  useLeaderboardSocket('leaderboards.entry.updated', handleEntryUpdated);

  function handleModeChange(next: GameMode) {
    setMode(next);
    setPage(1);
    setAccumulated([]);
  }

  function handleScopeChange(next: Scope) {
    setScope(next);
    setPage(1);
    setAccumulated([]);
  }

  function handleRangeChange(next: Range) {
    setRange(next);
    setPage(1);
    setAccumulated([]);
  }

  // Blocker #3: jump to the actual self row inside the table, not the
  // already-in-viewport pinned bar. Use window.scrollTo with a header
  // offset (per project guideline) — scrollIntoView breaks header math.
  function jumpToSelf() {
    if (!data?.self) return;
    const target = document.querySelector<HTMLElement>('[data-self="true"]');
    if (!target) {
      // Self row isn't on the current page yet — TODO(ARC-588-self-page):
      // compute which page contains data.self.rank and load it.
      return;
    }
    const top =
      target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  function handleShare() {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      navigator
        .share?.({
          title: 'Arcadeum leaderboard',
          url: typeof location !== 'undefined' ? location.href : undefined,
        })
        .catch(() => {});
    }
  }

  // Blocker #4: measure the pinned row so the page reserves room for it
  // even when it wraps to two lines on small viewports.
  const selfRowMountRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setSelfRowHeight(entry.contentRect.height);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const heroT = (t?.hero ?? {}) as {
    eyebrow?: string;
    title?: string;
    tagline?: string;
  };
  const tickerT = (t?.ticker ?? {}) as { live?: string };
  const mythicLabels = (t?.mythic ?? {}) as Record<string, string>;
  const regionLabels = (t?.regions ?? {}) as Record<string, string | undefined>;
  const emptyT = (t?.empty ?? {}) as { title?: string; body?: string };
  const errorT = (t?.errorState ?? {}) as { title?: string; retry?: string };
  const loadMoreLabel = (t?.loadMore as string) ?? 'Load more';

  // BE applies the `q` / `scope` / `range` filters; we just render whatever
  // the server returns.
  const filteredRows = useMemo(
    () => (accumulated.length > 0 ? accumulated : (data?.rows ?? [])),
    [accumulated, data?.rows],
  );

  // Bug #10: live updates can bump rating past the snapshot's topRating.
  // Recompute max from current rows so the EnergyBar fill stays correct.
  const maxRating = useMemo(() => {
    let max = data?.topRating ?? 0;
    for (const r of filteredRows) if (r.rating > max) max = r.rating;
    return max;
  }, [data?.topRating, filteredRows]);

  if (error) {
    return (
      <PageLayout>
        <Container size="lg">
          <YStack paddingVertical="$8">
            <ErrorState
              title={errorT.title ?? "Couldn't load leaderboard"}
              message={error.message}
              retryLabel={errorT.retry ?? 'Retry'}
              onRetry={refetch}
              data-testid="leaderboard-error-state"
            />
          </YStack>
        </Container>
      </PageLayout>
    );
  }

  const totalRows = data?.totalRows ?? 0;
  const showEmpty = !isLoading && data && filteredRows.length === 0;
  const canLoadMore =
    !isLoading && accumulated.length > 0 && accumulated.length < totalRows;

  const second = data?.rows[1];
  const third = data?.rows[2];
  const mythic = data?.mythic ?? null;
  const paddingBottom = data?.self
    ? Math.ceil(selfRowHeight + SELF_ROW_PADDING)
    : 32;

  return (
    <PageLayout>
      <Container size="lg">
        <YStack gap="$6" paddingBottom={paddingBottom}>
          <HeroBackdrop testID="leaderboard-hero">
            <YStack gap="$3" maxWidth={680}>
              <Text
                fontSize="$2"
                letterSpacing={2}
                opacity={0.7}
                textTransform="uppercase"
                color="$mythicAccent"
              >
                {heroT.eyebrow ?? 'Live · Season 4'}
              </Text>
              <Text
                fontSize="$10"
                fontWeight="900"
                letterSpacing={-1}
                $sm={{ fontSize: '$8' }}
              >
                {heroT.title ?? 'Race the leaderboard.'}
              </Text>
              <Text fontSize="$4" opacity={0.85}>
                {heroT.tagline ??
                  'Updated every 30 seconds. Top 100 players gear up for the Champions Cup.'}
              </Text>
            </YStack>
            <EventTicker
              events={data?.tickerEvents ?? []}
              liveLabel={tickerT.live ?? 'Live'}
              testID="leaderboard-ticker"
            />
          </HeroBackdrop>

          <FreshnessIndicator
            capturedAt={data?.capturedAt}
            pulseKey={freshnessPulseKey}
            t={t}
          />
          <CupCountdown cup={data?.cup ?? null} t={t} />

          {mythic ? (
            <XStack gap="$4" flexWrap="wrap" alignItems="stretch">
              <View flex={2} minWidth={360}>
                <MythicSpotlight
                  rank={mythic.rank}
                  name={mythic.name}
                  rating={mythic.rating}
                  ratingDelta={mythic.ratingDelta}
                  streak={mythic.streak}
                  region={
                    regionLabels[mythic.region] ?? mythic.region.toUpperCase()
                  }
                  recentForm={mythic.recentForm}
                  portrait={
                    <EquippedPlayerAvatar
                      name={mythic.name}
                      size="lg"
                      equippedAvatarId={mythic.equippedAvatarId}
                      equippedBadgeId={mythic.equippedBadgeId}
                      equippedNameColorId={mythic.equippedNameColorId}
                      equippedFrameId={mythic.equippedFrameId}
                      equippedAuraId={mythic.equippedAuraId}
                      equippedBannerId={mythic.equippedBannerId}
                      fallbackAvatarUrl={mythic.avatarUrl}
                      priority
                    />
                  }
                  streakLabel={(
                    mythicLabels.streak ?? '{count}-game streak'
                  ).replace('{count}', String(mythic.streak))}
                  leadLabel={(
                    mythicLabels.leadOver ?? '+{delta} over #2'
                  ).replace('{delta}', String(mythic.ratingDelta))}
                  recentLabel={mythicLabels.recentLabel ?? 'Last 12 matches'}
                  // Bug #8: until the three CTAs do distinct things,
                  // expose only "View profile" so we don't train users to
                  // ignore the toolbar.
                  challengeLabel={mythicLabels.cta ?? 'View profile'}
                  onChallenge={() => {
                    router.push(`/players/${mythic.id}`);
                  }}
                />
              </View>
              {second ? (
                <YStack flex={1} minWidth={220} gap="$3">
                  <RunnerUpCard
                    place={2}
                    name={second.name}
                    rating={second.rating}
                    wins={second.wins}
                    winrate={second.winrate}
                    region={
                      regionLabels[second.region] ?? second.region.toUpperCase()
                    }
                    placeLabel={mythicLabels.runnerUp ?? 'Runner · Up'}
                    avatar={
                      <EquippedPlayerAvatar
                        name={second.name}
                        size="sm"
                        equippedAvatarId={second.equippedAvatarId}
                        equippedBadgeId={second.equippedBadgeId}
                        equippedNameColorId={second.equippedNameColorId}
                        equippedFrameId={second.equippedFrameId}
                        equippedAuraId={second.equippedAuraId}
                        equippedBannerId={second.equippedBannerId}
                        fallbackAvatarUrl={second.avatarUrl}
                        priority
                      />
                    }
                  />
                  {third ? (
                    <RunnerUpCard
                      place={3}
                      name={third.name}
                      rating={third.rating}
                      wins={third.wins}
                      winrate={third.winrate}
                      region={
                        regionLabels[third.region] ?? third.region.toUpperCase()
                      }
                      placeLabel={mythicLabels.thirdPlace ?? '3rd · Place'}
                      avatar={
                        <EquippedPlayerAvatar
                          name={third.name}
                          size="sm"
                          equippedAvatarId={third.equippedAvatarId}
                          equippedBadgeId={third.equippedBadgeId}
                          equippedNameColorId={third.equippedNameColorId}
                          equippedFrameId={third.equippedFrameId}
                          equippedAuraId={third.equippedAuraId}
                          equippedBannerId={third.equippedBannerId}
                          fallbackAvatarUrl={third.avatarUrl}
                          priority
                        />
                      }
                    />
                  ) : null}
                </YStack>
              ) : null}
            </XStack>
          ) : null}

          <GameModeTabs value={mode} onChange={handleModeChange} t={t} />

          <XStack gap="$4" flexWrap="wrap">
            <ClimbersFallersRail
              climbers={data?.climbers ?? []}
              fallers={data?.fallers ?? []}
              t={t}
            />
            <SquadStrip squads={data?.squads ?? []} t={t} />
          </XStack>

          <RewardLadder rewards={data?.rewards ?? []} t={t} />

          <LeaderboardControls
            scope={scope}
            onScopeChange={handleScopeChange}
            range={range}
            onRangeChange={handleRangeChange}
            search={search}
            onSearchChange={setSearch}
            onJumpToSelf={data?.self ? jumpToSelf : undefined}
            t={t}
          />

          {showEmpty ? (
            <EmptyState
              message={emptyT.body ?? 'Be the first to climb the ladder.'}
            />
          ) : (
            <>
              <RankTable
                rows={filteredRows}
                loading={isLoading && accumulated.length === 0}
                topRating={maxRating}
                selfId={data?.self?.id}
                t={t}
              />
              {canLoadMore ? (
                <XStack justifyContent="center">
                  <Button
                    variant="ghost"
                    onClick={() => setPage((p) => p + 1)}
                    data-testid="leaderboard-load-more"
                  >
                    {loadMoreLabel}
                  </Button>
                </XStack>
              ) : null}
            </>
          )}

          <RegionStrip regions={data?.regions ?? []} t={t} />
        </YStack>
      </Container>
      {data?.self ? (
        <View ref={selfRowMountRef as never}>
          <PinnedSelfRow
            player={data.self}
            topRating={maxRating}
            onShare={handleShare}
            t={t}
          />
        </View>
      ) : null}
    </PageLayout>
  );
}
