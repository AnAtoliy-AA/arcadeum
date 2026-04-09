'use client';

import { useLanguage, formatMessage } from '@/shared/i18n/context';
import { appConfig } from '@/shared/config/app-config';
import { useScrollReveal } from '@/shared/lib/useScrollReveal';
import { PitchDeckSection } from './styles/PitchDeck.styles';
import {
  SectionHeader,
  SectionTitle,
  SectionSubtitle,
} from './styles/Common.styles';
import { WebPresentation } from './WebPresentation';

export function HomePitchDeck() {
  const { messages } = useLanguage();
  const { appName } = appConfig;
  const sectionRef = useScrollReveal<HTMLDivElement>();
  const homeCopy = messages.home ?? {};

  const sectionTitle =
    formatMessage((homeCopy as Record<string, string>).pitchDeckSectionTitle, {
      appName,
    }) ?? 'Project Vision';
  const sectionSubtitle =
    (homeCopy as Record<string, string>).pitchDeckSectionSubtitle ??
    'Explore the strategy and vision behind the platform';

  return (
    <PitchDeckSection id="presentation" ref={sectionRef as never}>
      <SectionHeader data-reveal data-reveal-delay="1">
        <SectionTitle>{sectionTitle}</SectionTitle>
        <SectionSubtitle>{sectionSubtitle}</SectionSubtitle>
      </SectionHeader>

      <div data-reveal data-reveal-delay="2">
        <WebPresentation />
      </div>
    </PitchDeckSection>
  );
}
