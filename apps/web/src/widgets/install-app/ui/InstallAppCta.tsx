'use client';

import { useLanguage, formatMessage } from '@/shared/i18n/context';
import { appConfig } from '@/shared/config/app-config';
import { usePWAInstallProps } from '@/features/pwa';
import { StaticDownloadButtons } from './StaticDownloadButtons';

export default function InstallAppCta() {
  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};

  const { appName } = appConfig;

  const title =
    formatMessage(homeCopy.downloadsTitle, { appName }) ?? `Install ${appName}`;
  const rawDescription =
    (homeCopy as Record<string, string>).pwaDescription ??
    `Install ${appName} as a Web App on your device for the ultimate board game experience. Same performance, more convenience.`;
  const description =
    formatMessage(rawDescription, { appName }) ?? rawDescription;

  const { onInstall, onShowInstructions } = usePWAInstallProps();

  return (
    <section
      data-testid="download-cta-section"
      className="mx-auto flex w-full max-w-[1400px] flex-col items-center py-12 [content-visibility:auto] [contain-intrinsic-size:auto_400px]"
    >
      <div className="flex w-full max-w-[700px] flex-col items-center gap-5 rounded-[24px] border border-glass-border bg-glass-bg p-8">
        <h2 className="m-0 text-center text-[24px] font-semibold text-color">
          {title}
        </h2>
        <p className="m-0 max-w-[500px] text-center text-[18px] leading-5 text-color opacity-70">
          {description}
        </p>
        <div className="mt-4 w-full">
          <StaticDownloadButtons
            onInstall={onInstall}
            onShowInstructions={onShowInstructions}
          />
        </div>
      </div>
    </section>
  );
}
