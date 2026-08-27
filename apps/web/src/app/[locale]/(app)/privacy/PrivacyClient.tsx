'use client';

import dynamic from 'next/dynamic';
import { PageLayout, Container, GlassCard, Skeleton } from '@arcadeum/ui';

const LoadingSkeleton = () => (
  <PageLayout>
    <Container size="md">
      <GlassCard>
        <div className="flex flex-col items-stretch -mb-4">
          <Skeleton className={'h-[60px] w-[60%]'} />
        </div>
        <Skeleton className={'h-[20px] w-[30%]'} />
      </GlassCard>
      <div className="flex flex-col items-stretch gap-6 -mt-8">
        {[1, 2, 3].map((i) => (
          <div className="flex flex-col items-stretch gap-3" key={i}>
            <Skeleton className={'h-[30px] w-[40%]'} />
            <Skeleton className={'h-[100px] w-full'} />
          </div>
        ))}
      </div>
    </Container>
  </PageLayout>
);

import type { PrivacyContentProps } from './PrivacyContent';

const PrivacyContentDynamic = dynamic<PrivacyContentProps>(
  () => import('./PrivacyContent'),
  {
    ssr: false,
    loading: LoadingSkeleton,
  },
);

const PrivacyClient = ({ t, contactT, PRIVACY_EMAIL }: PrivacyContentProps) => {
  return (
    <PrivacyContentDynamic
      t={t}
      contactT={contactT}
      PRIVACY_EMAIL={PRIVACY_EMAIL}
    />
  );
};

export default PrivacyClient;
