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
      className="pitch-deck-section-main"
    >
      <div className="section-header-main" data-reveal data-reveal-delay="1">
        <h2 className="section-title-main">{sectionTitle}</h2>
        <p className="section-subtitle-main">{sectionSubtitle}</p>
      </div>

      <div data-reveal data-reveal-delay="2">
        <WebPresentation />
      </div>
    </section>
  );
}
