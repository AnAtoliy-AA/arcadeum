'use client';
import { useCallback, useState } from 'react';
import type { PageTranslations } from '@/shared/i18n/page-translations';
import { useLanguage } from '@/shared/i18n/context';
import {
  PageLayout,
  Container,
  YStack,
  XStack,
  Button,
  EmptyState,
  ErrorState,
  MythicSpotlight,
} from '@arcadeum/ui';
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

const PAGE_SIZE = 50;

interface LeaderboardsPageContentProps {
  t?: PageTranslations;
  selfId?: string;
}

export default function LeaderboardsPageContent({
  t: initialT,
  selfId,
}: LeaderboardsPageContentProps) {
  const { messages } = useLanguage();
  const t =
    (messages.pages?.leaderboards as unknown as PageTranslations) || initialT;
  const [mode, setMode] = useState<GameMode>('all');
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<LeaderboardPlayer[]>([]);

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
    page,
    pageSize: PAGE_SIZE,
    onSuccess: handleLoaded,
  });

  function handleModeChange(next: GameMode) {
    setMode(next);
    setPage(1);
    setAccumulated([]);
  }

  const mythicLabels = (t?.mythic ?? {}) as {
    streak?: string;
    leadOver?: string;
    cta?: string;
  };
  const regionLabels = (t?.regions ?? {}) as Record<string, string | undefined>;
  const emptyT = (t?.empty ?? {}) as { title?: string; body?: string };
  const errorT = (t?.errorState ?? {}) as { title?: string; retry?: string };
  const loadMoreLabel = (t?.loadMore as string) ?? 'Load more';

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

  const showEmpty = !isLoading && data && accumulated.length === 0;
  const totalRows = data?.totalRows ?? 0;
  const canLoadMore =
    !isLoading && accumulated.length > 0 && accumulated.length < totalRows;

  return (
    <PageLayout>
      <Container size="lg">
        <YStack gap="$6" paddingBottom="$10">
          <CupCountdown cup={data?.cup ?? null} t={t} />
          {data?.mythic ? (
            <MythicSpotlight
              rank={data.mythic.rank}
              name={data.mythic.name}
              rating={data.mythic.rating}
              ratingDelta={data.mythic.ratingDelta}
              streak={data.mythic.streak}
              region={
                regionLabels[data.mythic.region] ??
                data.mythic.region.toUpperCase()
              }
              streakLabel={(
                mythicLabels.streak ?? '{count}-game streak'
              ).replace('{count}', String(data.mythic.streak))}
              leadLabel={(mythicLabels.leadOver ?? '+{delta} over #2').replace(
                '{delta}',
                String(data.mythic.ratingDelta),
              )}
              ctaLabel={mythicLabels.cta ?? 'View profile'}
              onPressCta={() => {
                /* TODO(ARC-588-profile): route to player profile */
              }}
            />
          ) : null}
          <GameModeTabs value={mode} onChange={handleModeChange} t={t} />
          <ClimbersFallersRail
            climbers={data?.climbers ?? []}
            fallers={data?.fallers ?? []}
            t={t}
          />
          <RewardLadder rewards={data?.rewards ?? []} t={t} />
          {showEmpty ? (
            <EmptyState
              message={emptyT.body ?? 'Be the first to climb the ladder.'}
            />
          ) : (
            <>
              <RankTable
                rows={accumulated.length > 0 ? accumulated : (data?.rows ?? [])}
                loading={isLoading && accumulated.length === 0}
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
          <SquadStrip squads={data?.squads ?? []} t={t} />
          <RegionStrip regions={data?.regions ?? []} t={t} />
        </YStack>
      </Container>
      {data?.self ? <PinnedSelfRow player={data.self} t={t} /> : null}
    </PageLayout>
  );
}
