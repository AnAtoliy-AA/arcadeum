'use client';

import Image from 'next/image';
import { Badge } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { Achievement } from '@/features/achievements/server/achievements.types';

interface ProfileAchievementsShowcaseProps {
  achievements: Achievement[];
}

const RARITY_CLASSES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  common: {
    bg: 'bg-neutral-500/20',
    text: 'text-neutral-300',
    border: 'border-neutral-500/40',
  },
  rare: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
  },
  epic: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/40',
  },
  legendary: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
  },
};

export function ProfileAchievementsShowcase({
  achievements,
}: ProfileAchievementsShowcaseProps) {
  const { t } = useTranslation();

  if (achievements.length === 0) return null;

  return (
    <div className="flex flex-col items-stretch gap-3">
      <div className="flex flex-row items-center gap-2">
        <span className="text-[18px] font-bold">
          🏆 {t('pages.achievements.title')}
        </span>
        <Badge variant="neutral" size="sm">
          {achievements.length}
        </Badge>
      </div>
      <div className="flex flex-row gap-2 overflow-x-auto pb-1">
        {achievements.map((achievement) => {
          const style =
            RARITY_CLASSES[achievement.rarity] || RARITY_CLASSES.common;
          return (
            <div
              key={achievement.achievementId}
              className="flex min-w-[100px] shrink-0 flex-col items-center gap-1.5 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-3 backdrop-blur-md"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.bg} ${style.text}`}
              >
                {achievement.iconUrl ? (
                  <Image
                    src={achievement.iconUrl}
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded object-contain"
                    unoptimized
                  />
                ) : (
                  '🏆'
                )}
              </span>
              <span className="truncate text-center text-[11px] font-semibold text-[var(--color)]">
                {achievement.name}
              </span>
              <span
                className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase ${style.text} ${style.border}`}
              >
                {achievement.rarity}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
