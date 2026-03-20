'use client';

import { useState } from 'react';
import { YStack } from 'tamagui';
import { appConfig } from '@/shared/config/app-config';
import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import {
  PresentationSection,
  VideoContainer,
  VideoPlaceholder,
  PlaceholderOverlay,
  PlayButton,
} from './styles/Presentation.styles';

// Tamagui styled YStack types don't expose `tag` even though it works at runtime.
type WithHtmlProps<T> = T & { tag?: string };
const PlayButtonEl = PlayButton as React.ComponentType<
  WithHtmlProps<React.ComponentProps<typeof PlayButton>>
>;
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
      <VideoContainer style={{ paddingBottom: '56.25%' }}>
        {isPlaying ? (
          <iframe
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            src={`https://www.youtube-nocookie.com/embed/${presentationVideoId}?autoplay=1&rel=0&controls=1&mute=0`}
            allowFullScreen
            title="Arcadeum Trailer"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        ) : (
          <VideoPlaceholder onClick={() => setIsPlaying(true)} data-testid="video-placeholder">
            <img
              src="/images/home/video-cover.png"
              alt="Arcadeum Trailer Illustration"
              loading="lazy"
              data-testid="video-thumbnail"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            />
            <PlaceholderOverlay
              style={{
                background: 'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
              }}
            />
            {/* Pulse ring replaces ::after */}
            <YStack
              position="absolute"
              width={90}
              height={90}
              borderRadius={999}
              borderWidth={2.5}
              borderColor="rgba(255,255,255,0.5)"
              zIndex={1}
              pointerEvents="none"
              style={{ animation: 'playButtonPulse 3s infinite' }}
            />
            <PlayButtonEl
              tag="button"
              onClick={() => setIsPlaying(true)}
              aria-label="Play video"
              data-testid="play-btn"
            >
              <svg viewBox="0 0 24 24" style={{ width: 38, height: 38, fill: 'white', marginLeft: 6 }}>
                <path d="M8 5v14l11-7z" />
              </svg>
            </PlayButtonEl>
          </VideoPlaceholder>
        )}
      </VideoContainer>
    </PresentationSection>
  );
}
