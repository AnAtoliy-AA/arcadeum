'use client';

import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { appConfig } from '@/shared/config/app-config';
import { PitchDeckSection, DeckAction } from './styles/PitchDeck.styles';
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

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <DeckAction
          href="/documents/Arcadeum_The_Digital_Tabletop.pdf"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'transparent',
            border: '1px solid currentColor',
          }}
        >
          Download PDF Version
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </DeckAction>
      </div>
    </PitchDeckSection>
  );
}
