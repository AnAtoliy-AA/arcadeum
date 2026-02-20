import type { Metadata } from 'next';
import { ReferralDashboard } from './ReferralDashboard';

export const metadata: Metadata = {
  title: 'Invite Friends | Earn Rewards',
  description:
    'Invite friends and earn cosmetic badges, early access to upcoming game decks like The Heist and The Cursed Banquet.',
};

export default function ReferralsPage() {
  return <ReferralDashboard />;
}
