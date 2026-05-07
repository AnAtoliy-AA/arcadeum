'use client';
import { XStack, YStack, Text } from 'tamagui';
import { CountdownClock, LiveChip } from '@arcadeum/ui';
import type { CupSnapshot } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

export function CupCountdown({
  cup,
  t,
}: {
  cup: CupSnapshot | null;
  t?: PageTranslations;
}) {
  if (!cup) return null;
  const tt = (t?.cup ?? {}) as Record<string, string>;
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      gap="$4"
      flexWrap="wrap"
      padding="$4"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="rgba(255,255,255,0.02)"
    >
      <YStack gap="$2" flex={1} minWidth={220}>
        <XStack gap="$3" alignItems="center">
          <LiveChip label={(t?.live as string) ?? 'Live'} />
          <Text
            fontSize="$2"
            letterSpacing={2}
            opacity={0.7}
            textTransform="uppercase"
          >
            {tt.title ?? cup.title}
          </Text>
        </XStack>
        <Text fontSize="$8" fontWeight="800">
          {cup.title}
        </Text>
        <XStack gap="$5" flexWrap="wrap">
          <Stat
            label={tt.prizePool ?? 'Prize pool'}
            value={`$${cup.prizePoolUSD.toLocaleString()}`}
          />
          <Stat
            label={tt.participants ?? 'Participants'}
            value={cup.participantCount.toLocaleString()}
          />
        </XStack>
      </YStack>
      <YStack gap="$2" alignItems="flex-end">
        <Text fontSize="$2" opacity={0.7} textTransform="uppercase">
          {tt.endsIn ?? 'Ends in'}
        </Text>
        <CountdownClock targetIso={cup.endsAt} testID="cup-countdown-seconds" />
      </YStack>
    </XStack>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <YStack>
      <Text fontSize="$1" opacity={0.6} textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="$5" fontWeight="700" letterSpacing={1}>
        {value}
      </Text>
    </YStack>
  );
}
