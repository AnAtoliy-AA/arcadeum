'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { XStack, YStack, Text, View } from 'tamagui';
import { Button } from '@arcadeum/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { claimTierAction } from '../actions';
import type {
  BattlePassReward,
  BattlePassState,
  BattlePassTier,
} from '../server/battle-pass.types';

const REWARD_GLYPH: Record<BattlePassReward['type'], string> = {
  coins: '🪙',
  gems: '💎',
  cosmetic: '✨',
};

function rewardLabel(r: BattlePassReward): string {
  return `${REWARD_GLYPH[r.type]} ${r.label}`;
}

function nextThreshold(tiers: BattlePassTier[], xp: number) {
  const upcoming = tiers.find((t) => t.xpRequired > xp);
  return upcoming?.xpRequired ?? xp;
}

export function BattlePassView({ state }: { state: BattlePassState }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [claimed, setClaimed] = useState<number[]>(state.claimedTiers);
  const [pendingTier, setPendingTier] = useState<number | null>(null);

  const { season, xp, currentTier, isPremium } = state;
  const next = useMemo(
    () => nextThreshold(season.tiers, xp),
    [season.tiers, xp],
  );
  const maxed = currentTier >= season.tiers.length;
  const progressPct = maxed
    ? 100
    : Math.min(100, Math.round((xp / Math.max(1, next)) * 100));

  const endsLabel = t('battlePass.seasonEnds' as TranslationKey, {
    date: new Date(season.endsAt).toLocaleDateString(),
  });

  const handleClaim = (tier: number) => {
    setPendingTier(tier);
    startTransition(async () => {
      try {
        const res = await claimTierAction(tier);
        setClaimed(res.claimedTiers);
        router.refresh();
      } finally {
        setPendingTier(null);
      }
    });
  };

  return (
    <YStack
      gap="$5"
      padding="$4"
      maxWidth={1100}
      marginHorizontal="auto"
      width="100%"
    >
      <YStack gap="$2">
        <XStack alignItems="center" gap="$3" flexWrap="wrap">
          <Text fontSize="$9" fontWeight="900">
            {t('battlePass.title' as TranslationKey)}
          </Text>
          {isPremium ? (
            <View
              paddingHorizontal={10}
              paddingVertical={4}
              borderRadius={999}
              backgroundColor="rgba(251,191,36,0.15)"
              borderWidth={1}
              borderColor="rgba(251,191,36,0.4)"
            >
              <Text fontSize="$2" fontWeight="800" color="#fbbf24">
                👑 {t('battlePass.premiumActive' as TranslationKey)}
              </Text>
            </View>
          ) : null}
        </XStack>
        <Text fontSize="$4" opacity={0.75}>
          {t('battlePass.subtitle' as TranslationKey)}
        </Text>
        <Text fontSize="$3" opacity={0.6}>
          {season.title} · {endsLabel}
        </Text>
      </YStack>

      {/* XP progress to next tier */}
      <YStack gap="$2" role="status" aria-live="polite">
        <Text fontSize="$2" opacity={0.7}>
          {maxed
            ? t('battlePass.maxedOut' as TranslationKey)
            : t('battlePass.progress' as TranslationKey, { xp, next })}
        </Text>
        <View
          height={10}
          borderRadius={999}
          backgroundColor="rgba(255,255,255,0.08)"
          overflow="hidden"
        >
          <View
            height="100%"
            width={`${progressPct}%`}
            borderRadius={999}
            style={{
              background: 'linear-gradient(90deg, #38bdf8, #a78bfa)',
            }}
          />
        </View>
      </YStack>

      {!isPremium ? (
        <Text fontSize="$2" opacity={0.6}>
          🔒 {t('battlePass.unlockHint' as TranslationKey)}
        </Text>
      ) : null}

      {/* Tier rail */}
      <XStack
        gap="$3"
        overflow="scroll"
        paddingVertical="$2"
        data-testid="battle-pass-rail"
      >
        {season.tiers.map((tierDef) => {
          const unlocked = currentTier >= tierDef.tier;
          const isClaimed = claimed.includes(tierDef.tier);
          const busy = isPending && pendingTier === tierDef.tier;

          return (
            <YStack
              key={tierDef.tier}
              minWidth={160}
              gap="$3"
              padding="$3"
              borderRadius="$5"
              borderWidth={1}
              borderColor={
                unlocked ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)'
              }
              backgroundColor="rgba(15,23,42,0.55)"
              opacity={unlocked ? 1 : 0.6}
              data-testid={`battle-pass-tier-${tierDef.tier}`}
            >
              <Text fontSize="$3" fontWeight="800" letterSpacing={1}>
                {t('battlePass.tier' as TranslationKey, { tier: tierDef.tier })}
              </Text>

              <RewardNode
                label={t('battlePass.free' as TranslationKey)}
                reward={tierDef.freeReward}
                dimmed={false}
              />
              <RewardNode
                label={t('battlePass.premium' as TranslationKey)}
                reward={tierDef.premiumReward}
                dimmed={!isPremium}
                accent
              />

              {isClaimed ? (
                <Button variant="ghost" size="sm" disabled>
                  ✓ {t('battlePass.claimed' as TranslationKey)}
                </Button>
              ) : unlocked ? (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={busy}
                  onClick={() => handleClaim(tierDef.tier)}
                  data-testid={`battle-pass-claim-${tierDef.tier}`}
                >
                  {t('battlePass.claim' as TranslationKey)}
                </Button>
              ) : (
                <Button variant="secondary" size="sm" disabled>
                  🔒 {t('battlePass.locked' as TranslationKey)}
                </Button>
              )}
            </YStack>
          );
        })}
      </XStack>
    </YStack>
  );
}

function RewardNode({
  label,
  reward,
  dimmed,
  accent,
}: {
  label: string;
  reward: BattlePassReward;
  dimmed: boolean;
  accent?: boolean;
}) {
  return (
    <YStack
      gap={2}
      padding="$2"
      borderRadius="$3"
      backgroundColor={
        accent ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)'
      }
      borderWidth={1}
      borderColor={accent ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.06)'}
      opacity={dimmed ? 0.45 : 1}
    >
      <Text
        fontSize={10}
        textTransform="uppercase"
        letterSpacing={1}
        opacity={0.6}
        color={accent ? '#fbbf24' : '$gray11'}
      >
        {label}
      </Text>
      <Text fontSize="$3" fontWeight="700">
        {rewardLabel(reward)}
      </Text>
    </YStack>
  );
}
