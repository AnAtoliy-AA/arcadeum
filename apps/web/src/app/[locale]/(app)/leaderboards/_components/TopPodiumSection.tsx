'use client';
import { useRouter } from 'next/navigation';
import { MythicSpotlight, RunnerUpCard } from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import type {
  LeaderboardPlayer,
  Region,
} from '@/entities/leaderboard/model/types';
import { MythicBloom } from './MythicBloom';

const regionLabel = (
  region: Region | undefined,
  labels: Record<string, string | undefined>,
) => (region ? (labels[region] ?? region.toUpperCase()) : undefined);

export interface TopPodiumSectionProps {
  mythic?: (LeaderboardPlayer & { ratingDelta: number; streak: number }) | null;
  second?: LeaderboardPlayer | null;
  third?: LeaderboardPlayer | null;
  isLoading?: boolean;
  mythicLabels: {
    streak?: string;
    leadOver?: string;
    recentLabel?: string;
    cta?: string;
    runnerUp?: string;
    thirdPlace?: string;
  };
  regionLabels: Record<string, string | undefined>;
}

export function TopPodiumSection({
  mythic,
  second,
  third,
  isLoading,
  mythicLabels,
  regionLabels,
}: TopPodiumSectionProps) {
  const router = useRouter();

  if (mythic) {
    return (
      <div className="flex flex-row gap-4 flex-wrap items-stretch">
        <div className="flex-[2] min-w-[360px] relative">
          <MythicBloom />
          <MythicSpotlight
            rank={mythic.rank}
            name={mythic.name}
            rating={mythic.rating}
            ratingDelta={mythic.ratingDelta}
            streak={mythic.streak}
            region={regionLabel(mythic.region, regionLabels)}
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
                role={mythic.role}
                fallbackAvatarUrl={mythic.avatarUrl}
                priority
              />
            }
            streakLabel={(mythicLabels.streak ?? '{count}-game streak').replace(
              '{count}',
              String(mythic.streak),
            )}
            leadLabel={(mythicLabels.leadOver ?? '+{delta} over #2').replace(
              '{delta}',
              String(mythic.ratingDelta),
            )}
            recentLabel={mythicLabels.recentLabel ?? 'Last 12 matches'}
            challengeLabel={mythicLabels.cta ?? 'View profile'}
            onChallenge={() => {
              router.push(`/players/${mythic.id}`);
            }}
          />
        </div>
        {second ? (
          <div className="flex flex-col items-stretch flex-1 min-w-[220px] gap-3">
            <RunnerUpCard
              place={2}
              name={second.name}
              rating={second.rating}
              wins={second.wins}
              winrate={second.winrate}
              region={regionLabel(second.region, regionLabels)}
              placeLabel={mythicLabels.runnerUp ?? 'Runner · Up'}
              onClick={() => {
                router.push(`/players/${encodeURIComponent(second.id)}`);
              }}
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
                  role={second.role}
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
                region={regionLabel(third.region, regionLabels)}
                placeLabel={mythicLabels.thirdPlace ?? '3rd · Place'}
                onClick={() => {
                  router.push(`/players/${encodeURIComponent(third.id)}`);
                }}
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
                    role={third.role}
                    fallbackAvatarUrl={third.avatarUrl}
                    priority
                  />
                }
              />
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="flex flex-row gap-4 flex-wrap items-stretch"
        aria-hidden="true"
      >
        <div className="flex-[2] min-w-[360px] h-[340px] rounded-3xl border border-[var(--borderColor)]/40 bg-[rgba(255,255,255,0.02)] animate-pulse" />
        <div className="flex flex-col items-stretch flex-1 min-w-[220px] gap-3">
          <div className="h-[164px] rounded-2xl border border-[var(--borderColor)]/40 bg-[rgba(255,255,255,0.02)] animate-pulse" />
          <div className="h-[164px] rounded-2xl border border-[var(--borderColor)]/40 bg-[rgba(255,255,255,0.02)] animate-pulse" />
        </div>
      </div>
    );
  }

  return null;
}
