'use client';

import { XStack } from 'tamagui';
import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
import { Container } from '@arcadeum/ui/components/Container/Container';
import { HeroSection } from './HeroSection';
import { LocalAuthPanel } from './LocalAuthPanel';
import { OAuthPanel } from './OAuthPanel';
import { SessionStatusPanel } from './SessionStatusPanel';
import { DownloadSection } from './DownloadSection';
import { useAuthForm } from '../hooks/useAuthForm';
import { useAuthLabels } from '../hooks/useAuthLabels';
import { appConfig } from '@/shared/config/app-config';

export default function AuthPageContent() {
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
    <PageLayout>
      <Container size="lg">
        <HeroSection labels={labels} config={config.hero} />
        <XStack gap="$5" marginTop="$8" flexWrap="wrap" justifyContent="center">
          <LocalAuthPanel labels={labels} auth={auth} />
          <OAuthPanel auth={auth} />
          <SessionStatusPanel auth={auth} />
        </XStack>
        <DownloadSection labels={labels} />
      </Container>
    </PageLayout>
  );
}
