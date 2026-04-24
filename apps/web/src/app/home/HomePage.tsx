import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
import HomeHero from './components/HomeHero';
import HomeGames from './components/HomeGames';
import dynamic from 'next/dynamic';

const HomeHowItWorks = dynamic(() => import('./components/HomeHowItWorks'));
const HomeFeatures = dynamic(() => import('./components/HomeFeatures'));
const HomePresentation = dynamic(() => import('./components/HomePresentation'));
const HomePitchDeck = dynamic(() => import('./components/HomePitchDeck'));
const HomeDownloadCta = dynamic(() => import('./components/HomeDownloadCta'));

import HomeFooter from './components/HomeFooter';

export default function HomePage() {
  return (
    <PageLayout data-testid="page-layout">
      <HomeHero />
      <HomeGames />
      <HomeHowItWorks />
      <HomeFeatures />
      <HomePresentation />
      <HomePitchDeck />
      <HomeDownloadCta />
      <HomeFooter />
    </PageLayout>
  );
}
