'use client';
import { XStack, YStack, Text, View } from 'tamagui';
import { CountdownClock, LiveChip } from '@arcadeum/ui';
import type { CupSnapshot } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

// Temporary: tournaments aren't live yet. Flip to `true` to render the
// real cup UI (prize pool / countdown / qualified pills) defined below.
const TOURNAMENTS_ENABLED = false;

export function CupCountdown({
  cup,
  t,
}: {
  cup: CupSnapshot | null;
  t?: PageTranslations;
}) {
  const tt = (t?.cup ?? {}) as Record<string, string>;

  if (!TOURNAMENTS_ENABLED) {
    return (
      <YStack
        gap="$3"
        padding="$5"
        borderRadius="$4"
        borderWidth={1}
        borderColor="$borderColor"
        backgroundColor="rgba(255,255,255,0.02)"
        alignItems="center"
        testID="cup-coming-soon"
      >
        <Text
          fontSize="$1"
          letterSpacing={2}
          opacity={0.7}
          textTransform="uppercase"
        >
          {tt.eyebrow ?? 'Tournament'}
        </Text>
        <Text
          fontSize="$8"
          fontWeight="800"
          color="$mythicAccent"
          textAlign="center"
        >
          {tt.comingSoon ?? 'Coming soon'}
        </Text>
        <Text fontSize="$3" opacity={0.75} textAlign="center" maxWidth={520}>
          {tt.comingSoonBody ??
            'Live tournaments and prize pools are coming soon.'}
        </Text>
      </YStack>
    );
  }

  if (!cup) return null;
  const qualified = cup.qualified ?? [];
  const visiblePills = qualified.slice(0, 8);
  const overflow = Math.max(0, qualified.length - visiblePills.length);
  return (
    <YStack
      gap="$4"
      padding="$4"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="rgba(255,255,255,0.02)"
    >
      <XStack
        alignItems="center"
        justifyContent="space-between"
        gap="$4"
        flexWrap="wrap"
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
              {tt.eyebrow ?? 'Tournament'}
            </Text>
          </XStack>
          <Text fontSize="$8" fontWeight="800">
            {tt.title ?? cup.title}
          </Text>
          <XStack gap="$5" flexWrap="wrap">
            <Stat
              label={tt.prizePool ?? 'Prize pool'}
              value={`$${cup.prizePoolUSD.toLocaleString()}`}
              accent
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
          <CountdownClock
            targetIso={cup.endsAt}
            testID="cup-countdown-seconds"
          />
        </YStack>
      </XStack>

      {visiblePills.length > 0 ? (
        <YStack gap="$2">
          <Text
            fontSize="$1"
            letterSpacing={2}
            opacity={0.6}
            textTransform="uppercase"
          >
            {tt.qualifiedLabel ?? 'Qualified'}
          </Text>
          <XStack gap={6} flexWrap="wrap">
            {visiblePills.map((p) => (
              <View
                key={p.id}
                width={28}
                height={28}
                borderRadius={14}
                borderWidth={1}
                borderColor="$borderColor"
                alignItems="center"
                justifyContent="center"
                style={{
                  background: 'linear-gradient(180deg,#22d3ee,#6366f1)',
                }}
                aria-label={p.name}
              >
                <Text fontSize={11} fontWeight="700" color="#ffffff">
                  {p.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
            ))}
            {overflow > 0 ? (
              <View
                width={28}
                height={28}
                borderRadius={14}
                borderWidth={1}
                borderColor="$borderColor"
                alignItems="center"
                justifyContent="center"
                backgroundColor="rgba(255,255,255,0.04)"
              >
                <Text fontSize={11} opacity={0.7}>
                  +{overflow}
                </Text>
              </View>
            ) : null}
          </XStack>
        </YStack>
      ) : null}
    </YStack>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <YStack>
      <Text fontSize="$1" opacity={0.6} textTransform="uppercase">
        {label}
      </Text>
      <Text
        fontSize="$5"
        fontWeight="700"
        letterSpacing={1}
        color={accent ? '$mythicAccent' : undefined}
      >
        {value}
      </Text>
    </YStack>
  );
}
