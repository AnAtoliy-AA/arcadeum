import type { Metadata } from 'next';
import ReferralsClient from './ReferralsClient';
import { routes } from '@/shared/config/routes';

export const metadata: Metadata = {
  title: 'Invite Friends | Earn Rewards',
  description:
    'Invite friends and earn cosmetic badges, early access to upcoming game decks like The Heist and The Cursed Banquet.',
  alternates: {
    canonical: routes.referrals,
  },
};

export default function ReferralsPage() {
  return <ReferralsClient />;
}
