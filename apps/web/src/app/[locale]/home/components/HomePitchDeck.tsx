'use client';

import { useLanguage, formatMessage } from '@/shared/i18n/context';
import { appConfig } from '@/shared/config/app-config';
import { useScrollReveal } from '@/shared/lib/useScrollReveal';
import { WebPresentation } from './WebPresentation';

export default function HomePitchDeck() {
  const { messages } = useLanguage();
  const { appName } = appConfig;
  const sectionRef = useScrollReveal<HTMLElement>();
  const homeCopy = messages.home ?? {};

  const sectionTitle =
    formatMessage((homeCopy as Record<string, string>).pitchDeckSectionTitle, {
      appName,
    }) ?? 'Project Vision';
  const sectionSubtitle =
    (homeCopy as Record<string, string>).pitchDeckSectionSubtitle ??
    'Explore the strategy and vision behind the platform';

  return (
    <section
      id="pitch-deck"
      ref={sectionRef}
      className="mx-auto flex w-full max-w-[2000px] flex-col items-center gap-10 px-4 py-28 min-[1151px]:px-10 [content-visibility:auto] [contain-intrinsic-size:auto_800px]"
    >
      <div
        className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-3 px-4"
        data-reveal
        data-reveal-delay="1"
      >
        <h2 className="m-0 text-center text-[32px] font-bold tracking-[-0.5px] text-color">
          {sectionTitle}
        </h2>
        <p className="m-0 mx-auto max-w-[600px] text-center text-[18px] text-color opacity-70">
          {sectionSubtitle}
        </p>
      </div>

      <div data-reveal data-reveal-delay="2">
        <WebPresentation />
      </div>
    </section>
  );
}
