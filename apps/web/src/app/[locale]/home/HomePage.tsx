import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
import HomeHero from './components/HomeHero';
import { DailyRewardChip } from '@/features/daily-rewards/ui/DailyRewardChip';
import dynamic from 'next/dynamic';

// Single concatenated bundle of hero + presentation styles.
// The originals each became a separate render-blocking chunk under the
// Lighthouse simulator's per-chunk model (~303ms penalty each). Bundling
// to a single physical file collapses them to one HTTP round-trip.
// See docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic-results.md
import './components/styles/home-bundle.scss';

const HomeGames = dynamic(() => import('./components/HomeGames'));
const HomeHowItWorks = dynamic(() => import('./components/HomeHowItWorks'));
const HomeFeatures = dynamic(() => import('./components/HomeFeatures'));
const HomePresentation = dynamic(() => import('./components/HomePresentation'));
const HomePitchDeck = dynamic(() => import('./components/HomePitchDeck'));
const InstallAppCta = dynamic(() =>
  import('@/widgets/install-app').then((m) => m.InstallAppCta),
);

export default function HomePage() {
  return (
    <PageLayout data-testid="page-layout">
      <HomeHero />
      {/* Compact daily-reward CTA. Self-suppresses unless the user can claim
          right now, keeping the marketing-heavy home page uncluttered. */}
      <DailyRewardChip />
      <HomeGames />
      <HomeHowItWorks />
      <HomeFeatures />
      <HomePresentation />
      <HomePitchDeck />
      <InstallAppCta />
    </PageLayout>
  );
}
