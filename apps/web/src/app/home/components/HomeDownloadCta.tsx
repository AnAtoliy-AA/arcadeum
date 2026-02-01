'use client';

import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { appConfig } from '@/shared/config/app-config';
import { ComingSoonBadge } from './styles/Features.styles';
import {
  DownloadCtaSection,
  DownloadCtaCard,
  DownloadTitle,
  DownloadDescription,
} from './styles/DownloadCta.styles';

export function HomeDownloadCta() {
  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};

  const { appName } = appConfig;

  const title = homeCopy.downloadsTitle ?? 'Mobile Apps';
  const rawDescription =
    (homeCopy as Record<string, string>).mobileComingSoonDescription ??
    `Native iOS and Android apps for ${appName} are in development. Stay tuned!`;
  const description =
    formatMessage(rawDescription, { appName }) ?? rawDescription;
  const comingSoonLabel =
    (homeCopy as Record<string, string>).comingSoon ?? 'Coming Soon';

  return (
    <DownloadCtaSection>
      <DownloadCtaCard>
        <DownloadTitle>{title}</DownloadTitle>
        <DownloadDescription>{description}</DownloadDescription>
        <ComingSoonBadge>{comingSoonLabel}</ComingSoonBadge>
      </DownloadCtaCard>
    </DownloadCtaSection>
  );
}
