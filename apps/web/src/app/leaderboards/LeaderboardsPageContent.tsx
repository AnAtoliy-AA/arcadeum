'use client';
import { useState } from 'react';
import type { PageTranslations } from '@/shared/i18n/page-translations';
import { useLanguage } from '@/shared/i18n/context';
import { PageLayout, Container, YStack } from '@arcadeum/ui';
import { useLeaderboard } from '@/entities/leaderboard/model/useLeaderboard';
import type { GameMode } from '@/entities/leaderboard/model/types';
import { MythicSpotlight } from '@arcadeum/ui';

import { CupCountdown } from './_components/CupCountdown';
import { GameModeTabs } from './_components/GameModeTabs';
import { ClimbersFallersRail } from './_components/ClimbersFallersRail';
import { SquadStrip } from './_components/SquadStrip';
import { RegionStrip } from './_components/RegionStrip';
import { RewardLadder } from './_components/RewardLadder';
import { RankTable } from './_components/RankTable';
import { PinnedSelfRow } from './_components/PinnedSelfRow';

interface LeaderboardsPageContentProps {
  t?: PageTranslations;
}

export default function LeaderboardsPageContent({
  t: initialT,
}: LeaderboardsPageContentProps) {
  const { messages } = useLanguage();
  const t =
    (messages.pages?.leaderboards as unknown as PageTranslations) || initialT;
  const [mode, setMode] = useState<GameMode>('all');
  const { data, isLoading } = useLeaderboard({ mode });

  const mythicLabels = (t?.mythic ?? {}) as {
    streak?: string;
    leadOver?: string;
    cta?: string;
  };

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
              region={data.mythic.region}
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
          <GameModeTabs value={mode} onChange={setMode} t={t} />
          <ClimbersFallersRail
            climbers={data?.climbers ?? []}
            fallers={data?.fallers ?? []}
            t={t}
          />
          <RewardLadder rewards={data?.rewards ?? []} t={t} />
          <RankTable rows={data?.rows ?? []} loading={isLoading} t={t} />
          <SquadStrip squads={data?.squads ?? []} t={t} />
          <RegionStrip regions={data?.regions ?? []} t={t} />
        </YStack>
      </Container>
      {data?.self ? <PinnedSelfRow player={data.self} t={t} /> : null}
    </PageLayout>
  );
}
