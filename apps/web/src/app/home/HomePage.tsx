'use client';

import { PageLayout } from '@/shared/ui';
import { HomeHero } from './components/HomeHero';
import dynamic from 'next/dynamic';

const HomeGames = dynamic(() =>
  import('./components/HomeGames').then((mod) => mod.HomeGames),
);
const HomeHowItWorks = dynamic(() =>
  import('./components/HomeHowItWorks').then((mod) => mod.HomeHowItWorks),
);
const HomeFeatures = dynamic(() =>
  import('./components/HomeFeatures').then((mod) => mod.HomeFeatures),
);
const HomePresentation = dynamic(() =>
  import('./components/HomePresentation').then((mod) => mod.HomePresentation),
);
const HomePitchDeck = dynamic(() =>
  import('./components/HomePitchDeck').then((mod) => mod.HomePitchDeck),
);
const HomeDownloadCta = dynamic(() =>
  import('./components/HomeDownloadCta').then((mod) => mod.HomeDownloadCta),
);
const AppFooter = dynamic(() =>
  import('@/widgets/footer').then((mod) => mod.AppFooter),
);

export function HomePage() {
  return (
    <>
      <PageLayout
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
