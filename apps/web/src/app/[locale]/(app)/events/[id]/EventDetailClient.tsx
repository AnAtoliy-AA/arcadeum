'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';

const EventDetailPageContent = dynamic(
  () => import('./EventDetailPageContent'),
  {
    ssr: false,
    loading: () => <PageLoading layout="standard" />,
  },
);

const EventDetailClient = ({
  id,
  t,
  locale,
  accessToken,
}: {
  id: string;
  t?: Record<string, string>;
  locale?: string;
  accessToken?: string;
}) => {
  return (
    <EventDetailPageContent
      id={id}
      t={t}
      locale={locale}
      accessToken={accessToken}
    />
  );
};

export default EventDetailClient;
