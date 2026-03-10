'use client';

import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { appConfig } from '@/shared/config/app-config';
import { usePWAInstallProps } from '@/features/pwa';
import {
  DownloadCtaSection,
  DownloadCtaCard,
  DownloadTitle,
  DownloadDescription,
} from './styles/DownloadCta.styles';
import { DownloadButtons } from '@/shared/ui';

export function HomeDownloadCta() {
  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};

  const { appName } = appConfig;

  const title = homeCopy.downloadsTitle ?? 'Install the App';
  const rawDescription =
    (homeCopy as Record<string, string>).pwaDescription ??
    `Install ${appName} as a Web App on your device for the ultimate board game experience. Same performance, more convenience.`;
  const description =
    formatMessage(rawDescription, { appName }) ?? rawDescription;

  const { onInstall, onShowInstructions } = usePWAInstallProps();

  return (
    <DownloadCtaSection data-testid="download-cta-section">
      <DownloadCtaCard>
        <DownloadTitle>{title}</DownloadTitle>
        <DownloadDescription>{description}</DownloadDescription>
        <div style={{ marginTop: '2rem', width: '100%' }}>
          <DownloadButtons
            onInstall={onInstall}
            onShowInstructions={onShowInstructions}
          />
        </div>
      </DownloadCtaCard>
    </DownloadCtaSection>
  );
}
