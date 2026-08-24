'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';

const EventsPageContent = dynamic(() => import('./EventsPageContent'), {
  ssr: false,
  loading: () => <PageLoading layout="standard" />,
});

const EventsClient = ({
  t,
  locale,
  accessToken,
}: {
  t?: Record<string, string>;
  locale?: string;
  accessToken?: string;
}) => {
  return <EventsPageContent t={t} locale={locale} accessToken={accessToken} />;
};

export default EventsClient;
