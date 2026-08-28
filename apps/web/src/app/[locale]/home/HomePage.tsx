import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
import HomeHero from './components/HomeHero';
import { NoscriptFallback } from './components/NoscriptFallback';
import { ServerGamesNav } from './components/ServerGamesNav';
import type { Locale } from '@/shared/i18n';

import dynamic from 'next/dynamic';

const DailyRewardChip = dynamic(() =>
  import('@/features/daily-rewards/ui/DailyRewardChip').then(
    (m) => m.DailyRewardChip,
  ),
);

const EventBanner = dynamic(() =>
  import('@/features/events').then((m) => m.EventBanner),
);

// Single concatenated bundle of hero + presentation + section styles.
// The originals each became a separate render-blocking chunk under the
// Lighthouse simulator's per-chunk model (~303ms penalty each). Bundling
// to a single physical file collapses them to one HTTP round-trip.
// See docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic-results.md
import './components/styles/home-bundle.scss';

const HomeLivePulse = dynamic(() =>
  import('./components/HomeLivePulse').then((m) => m.HomeLivePulse),
);
const HomeGames = dynamic(() => import('./components/HomeGames'));
const HomeHowItWorks = dynamic(() => import('./components/HomeHowItWorks'));
const HomeFeatures = dynamic(() => import('./components/HomeFeatures'));
const HomePresentation = dynamic(() => import('./components/HomePresentation'));
const HomePitchDeck = dynamic(() => import('./components/HomePitchDeck'));
const InstallAppCta = dynamic(() =>
  import('@/widgets/install-app').then((m) => m.InstallAppCta),
);

export default function HomePage({ locale }: { locale: Locale }) {
  return (
    <PageLayout data-testid="page-layout">
      {/* Server-rendered navigation for AI agents */}
      <ServerGamesNav />
      <HomeHero locale={locale} />
      <EventBanner locale={locale} />
      <DailyRewardChip />
      <HomeLivePulse />
      <HomeGames />
      <HomeHowItWorks />
      <HomeFeatures />
      <HomePresentation />
      <HomePitchDeck />
      <InstallAppCta />
      {/* Server-rendered fallback for AI agents and disabled JavaScript */}
      <NoscriptFallback />
    </PageLayout>
  );
}
