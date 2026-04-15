'use client';

import { PageLayout } from '@/shared/ui';
import { HomeHero } from './components/HomeHero';
import { HomeGames } from './components/HomeGames';
import dynamic from 'next/dynamic';

const HomeHowItWorks = dynamic(() =>
  import('./components/HomeHowItWorks').then((m) => m.HomeHowItWorks),
);
const HomeFeatures = dynamic(() =>
  import('./components/HomeFeatures').then((m) => m.HomeFeatures),
);
const HomePresentation = dynamic(() =>
  import('./components/HomePresentation').then((m) => m.HomePresentation),
);
const HomePitchDeck = dynamic(() =>
  import('./components/HomePitchDeck').then((m) => m.HomePitchDeck),
);
const HomeDownloadCta = dynamic(() =>
  import('./components/HomeDownloadCta').then((m) => m.HomeDownloadCta),
);

import { AppFooter } from '@/widgets/footer';

export function HomePage() {
  return (
    <>
      <PageLayout
        data-testid="page-layout"
        justifyContent="flex-start"
        alignItems="stretch"
        padding={0}
      >
        <HomeHero />
        <HomeGames />
        <HomeHowItWorks />
        <HomeFeatures />
        <HomePresentation />
        <HomePitchDeck />
        <HomeDownloadCta />
      </PageLayout>
      <AppFooter />
    </>
  );
}

export default HomePage;
