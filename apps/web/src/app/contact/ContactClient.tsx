'use client';

import dynamic from 'next/dynamic';
import {
  PageLayout,
  Container,
  GlassCard,
  Skeleton,
  YStack,
} from '@/shared/ui';

const LoadingSkeleton = () => (
  <PageLayout>
    <Container size="md">
      <GlassCard>
        <YStack marginBottom="$4">
          <Skeleton height={60} width="60%" />
        </YStack>
        <Skeleton height={20} width="30%" />
      </GlassCard>
      <YStack gap="$6" marginTop="$8">
        <Skeleton height={150} width="100%" />
        <Skeleton height={150} width="100%" />
        <Skeleton height={150} width="100%" />
      </YStack>
    </Container>
  </PageLayout>
);

export const ContactClient = dynamic(
  () => import('./ContactView').then((mod) => mod.ContactView),
  {
    ssr: false,
    loading: LoadingSkeleton,
  },
);
