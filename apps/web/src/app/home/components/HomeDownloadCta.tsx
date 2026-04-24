'use client';

import { useLanguage, formatMessage } from '@/shared/i18n/context';
import { appConfig } from '@/shared/config/app-config';
import { usePWAInstallProps } from '@/features/pwa';
import { StaticDownloadButtons } from './StaticDownloadButtons';

export default function HomeDownloadCta() {
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
    <section
      data-testid="download-cta-section"
      className="download-cta-section-main"
    >
      <div className="download-card-main">
        <h2 className="download-title-main">{title}</h2>
        <p className="download-description-main">{description}</p>
        <div style={{ marginTop: 'var(--t-space-4)', width: '100%' }}>
          <StaticDownloadButtons
            onInstall={onInstall}
            onShowInstructions={onShowInstructions}
          />
        </div>
      </div>
    </section>
  );
}
