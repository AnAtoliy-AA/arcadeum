'use client';

import { PageLayout, Container, XStack } from '@/shared/ui';
import { HeroSection } from './HeroSection';
import { LocalAuthPanel } from './LocalAuthPanel';
import { OAuthPanel } from './OAuthPanel';
import { SessionStatusPanel } from './SessionStatusPanel';
import { DownloadSection } from './DownloadSection';
import { useAuthForm, useAuthLabels } from '../hooks';
import { appConfig } from '@/shared/config/app-config';

export function AuthPageContent() {
  const auth = useAuthForm();
  const { isRegisterMode } = auth;
  const labels = useAuthLabels(isRegisterMode);

  const config = {
    hero: {
      primaryActionHref: appConfig.supportCta.href,
      secondaryActionHref: appConfig.primaryCta.href,
    },
  };

  return (
    <PageLayout asChild>
      <main>
        <Container size="lg">
          <HeroSection labels={labels} config={config.hero} />
          <XStack
            gap="$5"
            marginTop="$8"
            flexWrap="wrap"
            justifyContent="center"
          >
            <LocalAuthPanel labels={labels} auth={auth} />
            <OAuthPanel auth={auth} />
            <SessionStatusPanel auth={auth} />
          </XStack>
          <DownloadSection labels={labels} />
        </Container>
      </main>
    </PageLayout>
  );
}
