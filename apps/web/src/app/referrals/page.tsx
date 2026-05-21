import type { Metadata } from 'next';

import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import ReferralsClient from './ReferralsClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Invite Friends',
    description:
      'Invite friends and earn cosmetic badges and early access to upcoming game decks.',
    path: routes.referrals,
    index: false,
    locale,
  });
}

export default function ReferralsPage() {
  return <ReferralsClient />;
}
