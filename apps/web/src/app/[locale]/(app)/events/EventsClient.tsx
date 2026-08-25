'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';
import type { GameNightEvent } from '@/features/events/model/types';

// Server-rendered (no `ssr: false`) so the server-fetched event list is
// visible to crawlers and paints without a loading spinner.
const EventsPageContent = dynamic(() => import('./EventsPageContent'), {
  loading: () => <PageLoading layout="standard" />,
});

const EventsClient = ({
  t,
  locale,
  accessToken,
  initialEvents,
}: {
  t?: Record<string, string>;
  locale?: string;
  accessToken?: string;
  initialEvents?: GameNightEvent[] | null;
}) => {
  return (
    <EventsPageContent
      t={t}
      locale={locale}
      accessToken={accessToken}
      initialEvents={initialEvents}
    />
  );
};

export default EventsClient;
