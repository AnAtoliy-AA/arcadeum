'use client';

import { appConfig } from '@/shared/config/app-config';
import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import {
  PresentationSection,
  VideoContainer,
} from './styles/Presentation.styles';
import {
  SectionHeader,
  SectionTitle,
  SectionSubtitle,
} from './styles/Common.styles';

export function HomePresentation() {
  const { presentationVideoId, appName } = appConfig;
  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};

  if (!presentationVideoId) {
    return null;
  }

  const sectionTitle =
    formatMessage((homeCopy as Record<string, string>).presentationTitle, {
      appName,
    }) ?? 'Watch the Trailer';
  const sectionSubtitle =
    (homeCopy as Record<string, string>).presentationSubtitle ??
    `See ${appName} in action`;

  return (
    <PresentationSection>
      <SectionHeader>
        <SectionTitle>{sectionTitle}</SectionTitle>
        <SectionSubtitle>{sectionSubtitle}</SectionSubtitle>
      </SectionHeader>
      <VideoContainer>
        <iframe
          src={`https://www.youtube.com/embed/${presentationVideoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Arcadeum Trailer"
        />
      </VideoContainer>
    </PresentationSection>
  );
}
