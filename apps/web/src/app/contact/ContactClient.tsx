'use client';

import dynamic from 'next/dynamic';
import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  YStack,
  Skeleton,
} from '@/shared/ui';

const LoadingSkeleton = () => (
  <PageLayout>
    <Container size="md">
      <GlassCard>
        <PageTitle size="xl" gradient>
          <Skeleton height={40} width="60%" />
        </PageTitle>
        <YStack marginTop="$2">
          <Skeleton height={20} width="80%" />
        </YStack>
      </GlassCard>
      <YStack gap="$6" marginTop="$8">
        <Skeleton height={150} width="100%" />
        <Skeleton height={150} width="100%" />
        <Skeleton height={150} width="100%" />
      </YStack>
    </Container>
  </PageLayout>
);

import type ContactView from './ContactView';

const ContactClient = dynamic<React.ComponentProps<typeof ContactView>>(
  () => import('./ContactView'),
  {
    ssr: false,
    loading: LoadingSkeleton,
  },
);

export default ContactClient;
