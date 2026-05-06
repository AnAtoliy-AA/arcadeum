import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
import HomeHero from './components/HomeHero';
import dynamic from 'next/dynamic';

// Single concatenated bundle of hero + footer + presentation styles.
// The 3 originals each became a separate render-blocking chunk under the
// Lighthouse simulator's per-chunk model (~303ms penalty each). Bundling
// to a single physical file collapses them to one HTTP round-trip.
// See docs/superpowers/specs/2026-05-06-home-perf-phase-2-diagnostic-results.md
import './components/styles/home-bundle.css';

const HomeGames = dynamic(() => import('./components/HomeGames'));
const HomeHowItWorks = dynamic(() => import('./components/HomeHowItWorks'));
const HomeFeatures = dynamic(() => import('./components/HomeFeatures'));
const HomePresentation = dynamic(() => import('./components/HomePresentation'));
const HomePitchDeck = dynamic(() => import('./components/HomePitchDeck'));
const InstallAppCta = dynamic(() =>
  import('@/widgets/install-app').then((m) => m.InstallAppCta),
);
const HomeFooter = dynamic(() => import('./components/HomeFooter'));

export default function HomePage() {
  return (
    <PageLayout data-testid="page-layout">
      <HomeHero />
      <HomeGames />
      <HomeHowItWorks />
      <HomeFeatures />
      <HomePresentation />
      <HomePitchDeck />
      <InstallAppCta />
      <HomeFooter />
    </PageLayout>
  );
}
