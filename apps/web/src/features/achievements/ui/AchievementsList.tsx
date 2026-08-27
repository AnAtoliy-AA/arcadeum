import { TrophyIcon } from '@arcadeum/ui';
import { getTranslations } from '@/shared/i18n/server';
import type { Locale } from '@/shared/i18n/types';
import { type DeepPartial } from '@/shared/i18n/base-types';
import {
  achievementsEn,
  type AchievementsI18n,
} from '@/shared/i18n/messages/pages/achievements/en';
import { getAchievementsStatus } from '../server/achievements.server';
import { AchievementGrid, type AchievementGridLabels } from './AchievementGrid';

interface AchievementsListProps {
  locale: Locale;
  userId: string;
}

function buildLabels(
  messages: DeepPartial<AchievementsI18n> | undefined,
): AchievementGridLabels {
  const m = messages ?? achievementsEn;
  return {
    claim: m.claim ?? achievementsEn.claim,
    claimed: m.claimed ?? achievementsEn.claimed,
    lockedTooltip: m.lockedTooltip ?? achievementsEn.lockedTooltip,
    error: m.errors?.generic ?? achievementsEn.errors.generic,
    categories: { ...achievementsEn.categories, ...m.categories },
    rarities: { ...achievementsEn.rarities, ...m.rarities },
    rewards: { ...achievementsEn.rewards, ...m.rewards },
  };
}

export async function AchievementsList({
  locale,
  userId: _userId,
}: AchievementsListProps) {
  // Status is always fetched with cookie auth — this section is only
  // mounted when the viewed profile belongs to the authenticated user.
  const status = await getAchievementsStatus();
  if (!status || status.achievements.length === 0) return null;

  const t = await getTranslations(locale);
  const labels = buildLabels(t.pages?.achievements);
  const title = t.pages?.achievements?.title ?? achievementsEn.title;

  return (
    <section
      className="flex w-full flex-col gap-3 rounded-[24px] border border-[var(--glassBorder)] bg-[var(--glassBg)] p-5 sm:p-6"
      data-testid="achievements-section"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span aria-hidden className="text-[#f59e0b]">
            <TrophyIcon size={20} />
          </span>
          <h2 className="text-[16px] font-semibold">{title}</h2>
        </div>
        <span
          className="text-[14px] opacity-60"
          data-testid="achievements-progress-count"
        >
          {status.totalUnlocked} / {status.totalAchievements}
        </span>
      </div>

      <AchievementGrid achievements={status.achievements} labels={labels} />
    </section>
  );
}
