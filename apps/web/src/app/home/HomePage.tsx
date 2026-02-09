'use client';

import { HomeHero } from './components/HomeHero';
import dynamic from 'next/dynamic';

const HomeGames = dynamic(() =>
  import('./components/HomeGames').then((mod) => mod.HomeGames),
);
const HomePresentation = dynamic(() =>
  import('./components/HomePresentation').then((mod) => mod.HomePresentation),
);
const HomePitchDeck = dynamic(() =>
  import('./components/HomePitchDeck').then((mod) => mod.HomePitchDeck),
);
const HomeFeatures = dynamic(() =>
  import('./components/HomeFeatures').then((mod) => mod.HomeFeatures),
);
const HomeHowItWorks = dynamic(() =>
  import('./components/HomeHowItWorks').then((mod) => mod.HomeHowItWorks),
);
const HomeDownloadCta = dynamic(() =>
  import('./components/HomeDownloadCta').then((mod) => mod.HomeDownloadCta),
);
const HomeFooter = dynamic(() =>
  import('./components/HomeFooter').then((mod) => mod.HomeFooter),
);
import { PageWrapper } from './components/styles/Common.styles';

export function HomePage() {
  return (
    <PageWrapper>
      <HomeHero />
      <HomePresentation />
      <HomePitchDeck />
      <HomeGames />
      <HomeFeatures />
      <HomeHowItWorks />
      <HomeDownloadCta />
      <HomeFooter />
    </PageWrapper>
  );
}

export default HomePage;
