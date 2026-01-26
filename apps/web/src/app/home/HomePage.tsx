'use client';

import { HomeHero } from './components/HomeHero';
import { HomeGames } from './components/HomeGames';
import { HomePresentation } from './components/HomePresentation';
import { HomePitchDeck } from './components/HomePitchDeck';
import { HomeFeatures } from './components/HomeFeatures';
import { HomeHowItWorks } from './components/HomeHowItWorks';
import { HomeDownloadCta } from './components/HomeDownloadCta';
import { HomeFooter } from './components/HomeFooter';
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
