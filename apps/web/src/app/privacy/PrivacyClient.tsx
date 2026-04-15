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
        {[1, 2, 3].map((i) => (
          <YStack key={i} gap="$3">
            <Skeleton height={30} width="40%" />
            <Skeleton height={100} width="100%" />
          </YStack>
        ))}
      </YStack>
    </Container>
  </PageLayout>
);

import type { PrivacyContentProps } from './PrivacyContent';

export const PrivacyClient = dynamic<PrivacyContentProps>(
  () => import('./PrivacyContent'),
  {
    ssr: false,
    loading: LoadingSkeleton,
  },
);
