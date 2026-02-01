'use client';

import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { appConfig } from '@/shared/config/app-config';
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
  const homeCopy = messages.home ?? {};

  const sectionTitle =
    formatMessage((homeCopy as Record<string, string>).pitchDeckSectionTitle, {
      appName,
    }) ?? 'Project Vision';
  const sectionSubtitle =
    (homeCopy as Record<string, string>).pitchDeckSectionSubtitle ??
    'Explore the strategy and vision behind the platform';

  return (
    <PitchDeckSection id="presentation">
      <SectionHeader>
        <SectionTitle>{sectionTitle}</SectionTitle>
        <SectionSubtitle>{sectionSubtitle}</SectionSubtitle>
      </SectionHeader>

      <WebPresentation />
    </PitchDeckSection>
  );
}
