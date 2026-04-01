'use client';

import { PageLayout } from '@/shared/ui';
import { HomeHero } from './components/HomeHero';
import { HomeGames } from './components/HomeGames';
import { HomeHowItWorks } from './components/HomeHowItWorks';
import { HomeFeatures } from './components/HomeFeatures';
import { HomePresentation } from './components/HomePresentation';
import { HomePitchDeck } from './components/HomePitchDeck';
import { HomeDownloadCta } from './components/HomeDownloadCta';
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
