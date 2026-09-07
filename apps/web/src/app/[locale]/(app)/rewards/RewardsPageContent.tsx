'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  Typography,
  Section,
  Button,
} from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import { useRoutes } from '@/shared/config/useRoutes';
import { cx } from '@arcadeum/ui/utils/cx';
import type { rewardsEn } from '@/shared/i18n/messages/pages/rewards/en';
import { SocialRewardsSection } from '@/features/social-rewards/ui/SocialRewardsSection';
import type { SocialRewardsStatus } from '@/features/social-rewards/server/social-rewards.types';
import type { DailyRewardStatus } from '@/features/daily-rewards/server/daily-rewards.types';
import { ClaimButton } from '@/features/daily-rewards/ui/ClaimButton';
import { dailyRewardsEn } from '@/shared/i18n/messages/pages/daily-rewards/en';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
      ? readonly DeepPartial<U>[]
      : T[P] extends object
        ? DeepPartial<T[P]>
        : T[P];
};

export type RewardsMessages = DeepPartial<typeof rewardsEn>;

export interface RewardsPageContentProps {
  t?: RewardsMessages;
  socialRewardsStatus?: SocialRewardsStatus | null;
  dailyRewardStatus?: DailyRewardStatus | null;
}

const STREAK_REWARDS = [
  { day: 1, amount: 10 },
  { day: 2, amount: 20 },
  { day: 3, amount: 35 },
  { day: 4, amount: 55 },
  { day: 5, amount: 80 },
  { day: 6, amount: 110 },
  { day: 7, amount: 150, gemBonus: 1 },
] as const;

export default function RewardsPageContent({
  t: initialT,
  socialRewardsStatus,
  dailyRewardStatus,
}: RewardsPageContentProps) {
  const { messages } = useLanguage();
  const routes = useRoutes();
  const [activeQuestTab, setActiveQuestTab] = useState<'daily' | 'weekly'>(
    'daily',
  );
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const rewards = messages.pages?.rewards ?? initialT;
  const dailyStreak = rewards?.dailyStreak;
  const quests = rewards?.quests;
  const tiers = rewards?.tiers;
  const socialRewards = rewards?.socialRewards;
  const referral = rewards?.referralHero;
  const faq = rewards?.faq;
  const cta = rewards?.cta;

  const toggleFaq = (idx: number) => {
    setExpandedFaq((prev) => (prev === idx ? null : idx));
  };

  return (
    <PageLayout>
      <Container size="xl">
        <div className="flex flex-col gap-10 py-6">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-8 backdrop-blur-xl md:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[var(--primary)] opacity-15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[var(--gold)] opacity-10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-start gap-4 md:max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--glassBorder)] bg-[var(--glassBg)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--gold)]">
                ⭐ {rewards?.subtitle ?? 'Rewards & Seasonal Pass'}
              </span>
              <PageTitle size="xl" gradient>
                {rewards?.title ?? 'Rewards Program'}
              </PageTitle>
              <Typography variant="body" uiSize="lg" alpha="high">
                {rewards?.description ??
                  'Earn coins, unlock cosmetic tiers, and maintain daily streaks across all game modes.'}
              </Typography>
            </div>
          </div>

          <Section>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Typography variant="heading" uiSize="xl" weight="800">
                  {dailyStreak?.title ?? 'Daily Login Streak'}
                </Typography>
                <Typography variant="body" uiSize="md" alpha="medium">
                  {dailyStreak?.subtitle ??
                    'Check in every day to claim bonus coins and mystery boxes.'}
                </Typography>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {STREAK_REWARDS.map((item) => {
                  const isClaimed =
                    dailyRewardStatus != null &&
                    item.day <= dailyRewardStatus.currentStreak;
                  const isActive =
                    dailyRewardStatus?.canClaim === true &&
                    item.day === dailyRewardStatus.nextDay;
                  const rewardLabel =
                    item.day === 7
                      ? `${item.amount} Coins + ${item.gemBonus} 💎`
                      : `${item.amount} Coins`;

                  return (
                    <GlassCard
                      key={item.day}
                      className={cx(
                        'flex flex-col items-center justify-between gap-3 p-4 text-center transition-all duration-200',
                        isActive
                          ? 'border-[var(--primary)] bg-[var(--glassBg)] ring-2 ring-[var(--primary)]/30'
                          : isClaimed
                            ? 'border-[var(--success)]/40 bg-[var(--glassBg)] opacity-75'
                            : 'border-[var(--borderColor)] opacity-90',
                      )}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--colorMuted)]">
                        {dailyStreak?.day
                          ? dailyStreak.day.replace('{day}', String(item.day))
                          : `Day ${item.day}`}
                      </span>
                      <span className="text-2xl">
                        {item.day === 7 ? '🎁' : isClaimed ? '✅' : '🪙'}
                      </span>
                      <Typography variant="label" uiSize="xs" weight="700">
                        {rewardLabel}
                      </Typography>
                      <span
                        className={cx(
                          'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                          isClaimed
                            ? 'bg-[var(--success)]/20 text-[var(--success)]'
                            : isActive
                              ? 'bg-[var(--primary)] text-white'
                              : 'bg-white/5 text-[var(--colorMuted)]',
                        )}
                      >
                        {isClaimed
                          ? (dailyStreak?.claimed ?? 'Claimed')
                          : isActive
                            ? (dailyStreak?.ready ?? 'Ready')
                            : 'Upcoming'}
                      </span>
                    </GlassCard>
                  );
                })}
              </div>

              {dailyRewardStatus && (
                <div className="flex flex-col items-center gap-3">
                  <ClaimButton
                    canClaim={dailyRewardStatus.canClaim}
                    nextRewardCoins={dailyRewardStatus.nextRewardCoins}
                    nextRewardGems={dailyRewardStatus.nextRewardGems}
                    labels={{
                      claim:
                        messages.pages?.dailyRewards?.claim ??
                        dailyRewardsEn.claim,
                      gemBonusSuffix:
                        messages.pages?.dailyRewards?.gemBonusSuffix ??
                        dailyRewardsEn.gemBonusSuffix,
                      claimed:
                        messages.pages?.dailyRewards?.claimed ??
                        dailyRewardsEn.claimed,
                      toastClaimed:
                        messages.pages?.dailyRewards?.toasts?.claimed ??
                        dailyRewardsEn.toasts.claimed,
                      toastGemBonusSuffix:
                        messages.pages?.dailyRewards?.toasts?.gemBonusSuffix ??
                        dailyRewardsEn.toasts.gemBonusSuffix,
                      errorAlreadyClaimed:
                        messages.pages?.dailyRewards?.errors?.alreadyClaimed ??
                        dailyRewardsEn.errors.alreadyClaimed,
                      errorUnauthorized:
                        messages.pages?.dailyRewards?.errors?.unauthorized ??
                        dailyRewardsEn.errors.unauthorized,
                      errorGeneric:
                        messages.pages?.dailyRewards?.errors?.generic ??
                        dailyRewardsEn.errors.generic,
                    }}
                  />
                </div>
              )}

              {!dailyRewardStatus && (
                <div className="flex justify-center">
                  <Link href="/auth">
                    <Button variant="primary" size="md">
                      {dailyStreak?.claim ?? 'Claim Reward'}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Section>

          <Section>
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <Typography variant="heading" uiSize="xl" weight="800">
                    {quests?.title ?? 'Active Quests & Bounties'}
                  </Typography>
                  <Typography variant="body" uiSize="md" alpha="medium">
                    {quests?.subtitle ??
                      'Complete challenges to earn coins and badges.'}
                  </Typography>
                </div>

                <div className="inline-flex rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-1">
                  <button
                    type="button"
                    onClick={() => setActiveQuestTab('daily')}
                    className={cx(
                      'rounded-lg px-4 py-1.5 text-xs font-bold transition-all',
                      activeQuestTab === 'daily'
                        ? 'bg-[var(--primary)] text-white shadow-sm'
                        : 'text-[var(--colorMuted)] hover:text-white',
                    )}
                  >
                    {quests?.dailyTab ?? 'Daily Quests'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveQuestTab('weekly')}
                    className={cx(
                      'rounded-lg px-4 py-1.5 text-xs font-bold transition-all',
                      activeQuestTab === 'weekly'
                        ? 'bg-[var(--primary)] text-white shadow-sm'
                        : 'text-[var(--colorMuted)] hover:text-white',
                    )}
                  >
                    {quests?.weeklyTab ?? 'Weekly Missions'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(quests?.items ?? []).map((quest, idx) => (
                  <GlassCard
                    key={idx}
                    className="flex flex-col justify-between gap-4 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <Typography variant="label" uiSize="md" weight="700">
                          {quest?.title}
                        </Typography>
                        <Typography variant="body" uiSize="sm" alpha="medium">
                          {quest?.description}
                        </Typography>
                      </div>
                      <span className="shrink-0 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-1 text-xs font-bold text-[var(--gold)]">
                        {quest?.reward}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-[var(--borderColor)] pt-3 text-xs">
                      <span className="font-semibold text-[var(--colorMuted)]">
                        Progress: {quest?.progress}
                      </span>
                      <span
                        className={cx(
                          'font-bold',
                          quest?.completed
                            ? 'text-[var(--success)]'
                            : 'text-[var(--primary)]',
                        )}
                      >
                        {quest?.completed ? '✓ Completed' : 'In Progress'}
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </Section>

          <Section>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Typography variant="heading" uiSize="xl" weight="800">
                  {tiers?.title ?? 'Seasonal Reward Tiers'}
                </Typography>
                <Typography variant="body" uiSize="md" alpha="medium">
                  {tiers?.subtitle ??
                    'Level up your account to unlock multipliers and cosmetic prestige.'}
                </Typography>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {(tiers?.levels ?? []).map((lvl) => (
                  <GlassCard
                    key={lvl?.name}
                    className="flex flex-col gap-4 p-5 transition-transform duration-200 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{lvl?.badge}</span>
                      <span className="rounded-md bg-white/5 px-2 py-1 text-xs font-semibold text-[var(--colorMuted)]">
                        {lvl?.requirement}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Typography variant="heading" uiSize="md" weight="700">
                        {lvl?.name}
                      </Typography>
                    </div>
                    <ul className="flex flex-col gap-2 border-t border-[var(--borderColor)] pt-3 text-xs text-[var(--colorMuted)]">
                      {(lvl?.perks ?? []).map((perk, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[var(--primary)]">✓</span>
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                ))}
              </div>
            </div>
          </Section>

          <Section>
            <SocialRewardsSection
              status={socialRewardsStatus}
              labels={{
                title: socialRewards?.title,
                subtitle: socialRewards?.subtitle,
                badge: socialRewards?.badge,
                claim: socialRewards?.claim,
                claimed: socialRewards?.claimed,
                followAndClaim: socialRewards?.followAndClaim,
                toastSuccess: socialRewards?.toastSuccess,
                errorAlreadyClaimed: socialRewards?.errorAlreadyClaimed,
                errorUnauthorized: socialRewards?.errorUnauthorized,
                errorGeneric: socialRewards?.errorGeneric,
              }}
            />
          </Section>

          {referral && (
            <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl border border-[var(--primary)]/30 bg-gradient-to-r from-[var(--primary)]/10 via-[var(--glassBg)] to-[var(--gold)]/10 p-8 backdrop-blur-xl md:flex-row md:p-10">
              <div className="flex max-w-xl flex-col gap-2">
                <Typography variant="heading" uiSize="lg" weight="800">
                  {referral.title}
                </Typography>
                <Typography variant="body" uiSize="md" alpha="medium">
                  {referral.description}
                </Typography>
              </div>
              <Link href={routes.referrals}>
                <Button variant="primary" size="md">
                  {referral.cta}
                </Button>
              </Link>
            </div>
          )}

          {faq?.items && faq.items.length > 0 && (
            <Section>
              <div className="flex flex-col gap-6" id="faq">
                <Typography variant="heading" uiSize="xl" weight="800">
                  {faq.title ?? 'Frequently Asked Questions'}
                </Typography>
                <div className="flex flex-col gap-3">
                  {faq.items.map((item, idx) => {
                    const isOpen = expandedFaq === idx;
                    return (
                      <GlassCard key={idx} className="p-0">
                        <button
                          type="button"
                          onClick={() => toggleFaq(idx)}
                          aria-expanded={isOpen}
                          className="flex w-full cursor-pointer items-center justify-between bg-transparent text-[var(--color)] p-5 text-left"
                        >
                          <Typography variant="label" uiSize="md" weight="700">
                            {item?.question}
                          </Typography>
                          <span
                            className={cx(
                              'text-lg text-[var(--colorMuted)] transition-transform duration-200',
                              isOpen ? 'rotate-180' : 'rotate-0',
                            )}
                          >
                            ▾
                          </span>
                        </button>
                        {isOpen && (
                          <div className="border-t border-[var(--borderColor)] p-5 pt-3">
                            <Typography
                              variant="body"
                              uiSize="sm"
                              alpha="medium"
                            >
                              {item?.answer}
                            </Typography>
                          </div>
                        )}
                      </GlassCard>
                    );
                  })}
                </div>
              </div>
            </Section>
          )}

          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-8 text-center md:p-12">
            <Typography variant="heading" uiSize="xl" weight="800">
              {cta?.title ?? 'Ready to Claim Your Loot?'}
            </Typography>
            <Typography
              variant="body"
              uiSize="md"
              alpha="medium"
              className="max-w-md"
            >
              {cta?.description ??
                'Jump into a game room now and start racking up coins and quest progress.'}
            </Typography>
            <Link href={routes.games} className="mt-2">
              <Button variant="primary" size="lg">
                {cta?.button ?? 'Play Free Now'}
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}
