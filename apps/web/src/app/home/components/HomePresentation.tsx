'use client';

import { useState } from 'react';
import { appConfig } from '@/shared/config/app-config';
import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import {
  PresentationSection,
  VideoContainer,
  VideoPlaceholder,
  ThumbnailImage,
  PlaceholderOverlay,
  PlayButton,
} from './styles/Presentation.styles';
import {
  SectionHeader,
  SectionTitle,
  SectionSubtitle,
} from './styles/Common.styles';

export function HomePresentation() {
  const { presentationVideoId, appName } = appConfig;
  const { messages } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
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

  // We removed the YouTube thumbnail URL to prevent even minimal cookie setting
  // from img.youtube.com before the user clicks play.

  return (
    <PresentationSection data-testid="presentation-section">
      <SectionHeader>
        <SectionTitle>{sectionTitle}</SectionTitle>
        <SectionSubtitle>{sectionSubtitle}</SectionSubtitle>
      </SectionHeader>
      <VideoContainer>
        {isPlaying ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${presentationVideoId}?autoplay=1&rel=0&controls=1&mute=0&partitioned=1&widget_referrer=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Arcadeum Trailer"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          />
        ) : (
          <VideoPlaceholder
            onClick={() => setIsPlaying(true)}
            data-testid="video-placeholder"
          >
            <ThumbnailImage
              src="/images/home/video-cover.png"
              alt="Arcadeum Trailer Illustration"
              loading="lazy"
              data-testid="video-thumbnail"
            />
            <PlaceholderOverlay />
            <PlayButton
              onClick={() => setIsPlaying(true)}
              aria-label="Play video"
              data-testid="play-btn"
            >
              <svg viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </PlayButton>
          </VideoPlaceholder>
        )}
      </VideoContainer>
    </PresentationSection>
  );
}
