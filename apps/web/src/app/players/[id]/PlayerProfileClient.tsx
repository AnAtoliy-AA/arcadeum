'use client';
import { useRouter } from 'next/navigation';
import { PageLayout, Container, YStack, Button } from '@arcadeum/ui';
import { Text } from 'tamagui';
import type { PageTranslations } from '@/shared/i18n/page-translations';

export default function PlayerProfileClient({
  id,
  t,
}: {
  id: string;
  t?: PageTranslations;
}) {
  const router = useRouter();
  const profileT = (t?.profile ?? {}) as Record<string, string | undefined>;
  return (
    <PageLayout>
      <Container size="md">
        <YStack
          gap="$4"
          paddingVertical="$8"
          alignItems="flex-start"
          testID={`player-profile-${id}`}
        >
          <Text
            fontSize="$2"
            letterSpacing={2}
            opacity={0.6}
            textTransform="uppercase"
          >
            {profileT.eyebrow ?? 'Player'}
          </Text>
          <Text fontSize="$9" fontWeight="800" letterSpacing={-0.5}>
            {id}
          </Text>
          <Text fontSize="$3" opacity={0.85} maxWidth={520}>
            {profileT.placeholder ??
              'Full profile with rating history, recent matches, and squad info is coming soon (ARC-588-profile).'}
          </Text>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            data-testid="player-profile-back"
            aria-label={profileT.back ?? 'Back to leaderboard'}
          >
            ← {profileT.back ?? 'Back to leaderboard'}
          </Button>
        </YStack>
      </Container>
    </PageLayout>
  );
}
