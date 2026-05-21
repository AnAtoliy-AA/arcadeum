import type { Metadata } from 'next';

import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import ReferralsClient from './ReferralsClient';

export const metadata: Metadata = buildMetadata({
  title: 'Invite Friends',
  description:
    'Invite friends and earn cosmetic badges and early access to upcoming game decks.',
  path: routes.referrals,
  index: false,
});

export default function ReferralsPage() {
  return <ReferralsClient />;
}
