'use client';

import { HomeHero } from './components/HomeHero';
import { HomeGames } from './components/HomeGames';
import { HomeFeatures } from './components/HomeFeatures';
import { HomeHowItWorks } from './components/HomeHowItWorks';
import { HomeDownloadCta } from './components/HomeDownloadCta';
import { HomeFooter } from './components/HomeFooter';
import { PageWrapper } from './components/styles/Common.styles';

export function HomePage() {
  return (
    <PageWrapper>
      <HomeHero />
      <HomeGames />
      <HomeFeatures />
      <HomeHowItWorks />
      <HomeDownloadCta />
      <HomeFooter />
    </PageWrapper>
  );
}

export default HomePage;
