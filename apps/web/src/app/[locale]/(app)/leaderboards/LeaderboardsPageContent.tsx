'use client';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from 'react';
import type { PageTranslations } from '@/shared/i18n/page-translations';
import { useLanguage } from '@/shared/i18n';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  PageLayout,
  Container,
  Button,
  EmptyState,
  ErrorState,
  HeroBackdrop,
  EventTicker,
} from '@arcadeum/ui';
import { useLeaderboard } from '@/entities/leaderboard/model/useLeaderboard';
import type {
  GameMode,
  LeaderboardPlayer,
  LeaderboardSnapshot,
  OpponentType,
} from '@/entities/leaderboard/model/types';

import { CupCountdown } from './_components/CupCountdown';
import {
  GameModeTabs,
  DEFAULT_LEADERBOARD_MODES,
} from './_components/GameModeTabs';
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
import { TopPodiumSection } from './_components/TopPodiumSection';
import { useLeaderboardRealtime } from './useLeaderboardRealtime';

const PAGE_SIZE = 50;
const SELF_ROW_FALLBACK_HEIGHT = 88;
const SELF_ROW_PADDING = 32;
const HEADER_OFFSET = 80;

interface LeaderboardsPageContentProps {
  t?: PageTranslations;
  selfId?: string;
  accessToken?: string;
  initialData?: LeaderboardSnapshot | null;
}

export default function LeaderboardsPageContent({
  t: initialT,
  selfId,
  accessToken,
  initialData,
}: LeaderboardsPageContentProps) {
  const { messages } = useLanguage();
  const t =
    (messages.pages?.leaderboards as unknown as PageTranslations) || initialT;
  const [mode, setMode] = useState<GameMode>('all');
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<LeaderboardPlayer[]>([]);
  const [scope, setScope] = useState<Scope>('global');
  const [range, setRange] = useState<Range>('week');
  const [opponentType, setOpponentType] = useState<OpponentType>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selfRowHeight, setSelfRowHeight] = useState(SELF_ROW_FALLBACK_HEIGHT);

  const handleLoaded = useCallback((snapshot: LeaderboardSnapshot) => {
    setAccumulated((prev) =>
      snapshot.page === 1 ? snapshot.rows : [...prev, ...snapshot.rows],
    );
  }, []);

  const isDefaultView =
    mode === 'all' &&
    page === 1 &&
    !debouncedSearch &&
    scope === 'global' &&
    range === 'week' &&
    opponentType === 'all';

  const { data, isLoading, error, refetch } = useLeaderboard({
    mode,
    selfId,
    accessToken,
    page,
    pageSize: PAGE_SIZE,
    q: debouncedSearch,
    scope,
    range,
    opponentType,
    initialData: isDefaultView ? initialData : undefined,
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

  const freshnessPulseKey = useLeaderboardRealtime({
    accessToken,
    enabled: realtimeEnabled,
    page,
    refetch,
    mode,
    setAccumulated,
  });

  function resetAndSet<T>(setter: (v: T) => void, next: T) {
    startTransition(() => {
      setter(next);
      setPage(1);
      setAccumulated([]);
    });
  }

  function handleModeChange(next: GameMode) {
    resetAndSet(setMode, next);
  }

  function handleScopeChange(next: Scope) {
    resetAndSet(setScope, next);
  }

  function handleRangeChange(next: Range) {
    resetAndSet(setRange, next);
  }

  function handleOpponentTypeChange(next: OpponentType) {
    resetAndSet(setOpponentType, next);
  }

  // Blocker #3: jump to the actual self row inside the table, not the
  // already-in-viewport pinned bar. Use window.scrollTo with a header
  // offset (per project guideline) — scrollIntoView breaks header math.
  function jumpToSelf() {
    if (!data?.self) return;
    const target = document.querySelector<HTMLElement>('[data-self="true"]');
    if (!target) {
      // Self row isn't on the current page — compute which page contains
      // data.self.rank and load it, then scroll to the row.
      const selfRank = data.self.rank;
      if (selfRank > 0) {
        const targetPage = Math.ceil(selfRank / PAGE_SIZE);
        if (targetPage !== page) {
          // Load the correct page and reset accumulated rows
          setPage(targetPage);
          setAccumulated([]);
        }
      }
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

  // BE applies the `q` / `scope` / `range` filters; we just render the result.
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
          <div className="flex flex-col items-stretch py-8">
            <ErrorState
              title={errorT.title ?? "Couldn't load leaderboard"}
              message={error.message}
              retryLabel={errorT.retry ?? 'Retry'}
              onRetry={refetch}
              data-testid="leaderboard-error-state"
            />
          </div>
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
        <div
          className="flex flex-col items-stretch gap-6"
          style={{ paddingBottom: paddingBottom }}
        >
          <HeroBackdrop data-testid="leaderboard-hero">
            <div className="flex flex-col items-stretch gap-3 max-w-[680px]">
              <span className="text-[14px] tracking-[2px] opacity-[0.9] uppercase text-[var(--mythicAccent)]">
                {heroT.eyebrow ?? 'Live · Season 4'}
              </span>
              <h1 className="m-0 text-[48px] font-black leading-[1.15] tracking-[-1px] max-[800px]:text-[32px]">
                {heroT.title ?? 'Race the leaderboard.'}
              </h1>
              <span className="text-[18px] opacity-[0.85]">
                {heroT.tagline ??
                  'Updated every 30 seconds. Top 100 players gear up for the Champions Cup.'}
              </span>
            </div>
            <div className="min-h-[44px]">
              <EventTicker
                events={data?.tickerEvents ?? []}
                liveLabel={tickerT.live ?? 'Live'}
                data-testid="leaderboard-ticker"
              />
            </div>
          </HeroBackdrop>

          <FreshnessIndicator
            capturedAt={data?.capturedAt}
            pulseKey={freshnessPulseKey}
            t={t}
          />
          <CupCountdown cup={data?.cup ?? null} t={t} />

          <TopPodiumSection
            mythic={mythic}
            second={second}
            third={third}
            isLoading={isLoading}
            mythicLabels={mythicLabels}
            regionLabels={regionLabels}
          />

          <GameModeTabs
            modes={data?.modes ?? DEFAULT_LEADERBOARD_MODES}
            value={mode}
            onChange={handleModeChange}
            t={t}
          />
          <div className="flex flex-row items-stretch gap-4 flex-wrap">
            <ClimbersFallersRail
              climbers={data?.climbers ?? []}
              fallers={data?.fallers ?? []}
              t={t}
            />
            {data?.squads?.length ? (
              <SquadStrip squads={data.squads} t={t} />
            ) : isLoading ? (
              <div className="flex flex-col items-stretch gap-3 p-4 rounded-2xl border border-[var(--borderColor)]/40 bg-[rgba(255,255,255,0.02)] flex-1 min-w-[280px] h-[220px] animate-pulse" />
            ) : null}
          </div>

          {data?.rewards?.length ? (
            <RewardLadder rewards={data.rewards} t={t} />
          ) : isLoading ? (
            <div className="flex flex-col items-stretch gap-3">
              <div className="w-[120px] h-[16px] rounded bg-[rgba(255,255,255,0.04)] animate-pulse" />
              <div className="flex flex-row items-stretch gap-3 flex-wrap">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex-1 min-w-[150px] h-[100px] rounded-xl border border-[var(--borderColor)]/30 bg-[rgba(255,255,255,0.02)] animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : null}
          <LeaderboardControls
            scope={scope}
            onScopeChange={handleScopeChange}
            range={range}
            onRangeChange={handleRangeChange}
            opponentType={opponentType}
            onOpponentTypeChange={handleOpponentTypeChange}
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
                <div className="flex flex-row items-stretch justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => setPage((p) => p + 1)}
                    data-testid="leaderboard-load-more"
                  >
                    {loadMoreLabel}
                  </Button>
                </div>
              ) : null}
            </>
          )}

          <RegionStrip regions={data?.regions ?? []} t={t} />
        </div>
      </Container>
      {data?.self ? (
        <div className="" ref={selfRowMountRef as never}>
          <PinnedSelfRow
            player={data.self}
            topRating={maxRating}
            onShare={handleShare}
            t={t}
          />
        </div>
      ) : null}
    </PageLayout>
  );
}
