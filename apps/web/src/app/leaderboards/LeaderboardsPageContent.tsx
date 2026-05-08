'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PageTranslations } from '@/shared/i18n/page-translations';
import { useLanguage } from '@/shared/i18n/context';
import {
  connectSockets,
  connectSocketsAnonymous,
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
  const selfRowRef = useRef<HTMLDivElement | null>(null);

  const handleLoaded = useCallback(
    (snapshot: LeaderboardSnapshot) => {
      setAccumulated((prev) =>
        page === 1 ? snapshot.rows : [...prev, ...snapshot.rows],
      );
    },
    [page],
  );

  const { data, isLoading, error, refetch } = useLeaderboard({
    mode,
    selfId,
    accessToken,
    page,
    pageSize: PAGE_SIZE,
    q: debouncedSearch,
    onSuccess: handleLoaded,
  });

  // Reset accumulator + page when the debounced query changes so we don't
  // append filtered rows onto previously unfiltered ones.
  useEffect(() => {
    const id = setTimeout(() => {
      setPage(1);
      setAccumulated([]);
    }, 0);
    return () => clearTimeout(id);
  }, [debouncedSearch]);

  useEffect(() => {
    if (accessToken) connectSockets(accessToken);
    else connectSocketsAnonymous();
  }, [accessToken]);

  // Refetch on capture broadcast and bump the freshness pulse.
  const [freshnessPulseKey, setFreshnessPulseKey] = useState(0);
  useLeaderboardSocket('leaderboards.captured', () => {
    setFreshnessPulseKey((k) => k + 1);
    if (page === 1) {
      refetch().catch(() => {});
    }
  });

  // Optimistic in-place update when a single entry's flags change.
  useLeaderboardSocket('leaderboards.entry.updated', (...args: unknown[]) => {
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
  });

  function handleModeChange(next: GameMode) {
    setMode(next);
    setPage(1);
    setAccumulated([]);
  }

  function jumpToSelf() {
    selfRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  // BE applies the `q` filter; we just render whatever the server returns.
  const filteredRows = useMemo(
    () => (accumulated.length > 0 ? accumulated : (data?.rows ?? [])),
    [accumulated, data?.rows],
  );

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

  return (
    <PageLayout>
      <Container size="lg">
        <YStack gap="$6" paddingBottom={120}>
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
              <Text fontSize="$10" fontWeight="900" letterSpacing={-1}>
                {heroT.title ?? 'Race the leaderboard.'}
              </Text>
              <Text fontSize="$4" opacity={0.85}>
                {heroT.tagline ??
                  'Updated every 30 seconds. Top 100 players gear up for the Champions Cup.'}
              </Text>
            </YStack>
            <View testID="leaderboard-ticker">
              <EventTicker
                events={data?.tickerEvents ?? []}
                liveLabel={tickerT.live ?? 'Live'}
              />
            </View>
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
                  streakLabel={(
                    mythicLabels.streak ?? '{count}-game streak'
                  ).replace('{count}', String(mythic.streak))}
                  leadLabel={(
                    mythicLabels.leadOver ?? '+{delta} over #2'
                  ).replace('{delta}', String(mythic.ratingDelta))}
                  recentLabel={mythicLabels.recentLabel ?? 'Last 12 matches'}
                  challengeLabel={mythicLabels.challenge ?? '⚔ Challenge'}
                  watchLabel={mythicLabels.watch ?? '▶ Watch replay'}
                  followLabel={mythicLabels.follow ?? 'Follow'}
                  onChallenge={() => {
                    router.push(`/players/${mythic.id}`);
                  }}
                  onWatch={() => {
                    router.push(`/players/${mythic.id}`);
                  }}
                  onFollow={() => {
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
            onScopeChange={setScope}
            range={range}
            onRangeChange={setRange}
            search={search}
            onSearchChange={setSearch}
            onJumpToSelf={jumpToSelf}
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
                topRating={data?.topRating}
                liveMatchRanks={data?.liveMatchRanks}
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
        <View ref={selfRowRef as never}>
          <PinnedSelfRow
            player={data.self}
            topRating={data.topRating}
            onShare={handleShare}
            t={t}
          />
        </View>
      ) : null}
    </PageLayout>
  );
}
