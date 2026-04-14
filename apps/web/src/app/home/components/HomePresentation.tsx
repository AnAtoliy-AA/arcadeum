'use client';

import { useState } from 'react';
import Image from 'next/image';
import { YStack } from 'tamagui';
import { appConfig } from '@/shared/config/app-config';
import { useLanguage, formatMessage } from '@/shared/i18n/context';
import { useScrollReveal } from '@/shared/lib/useScrollReveal';
import {
  PresentationSection,
  VideoContainer,
  VideoPlaceholder,
  PlaceholderOverlay,
  PulseRing,
  PlayButton,
} from './styles/Presentation.styles';
import {
  SectionHeader,
  SectionTitle,
  SectionSubtitle,
} from './styles/Common.styles';

// Tamagui styled YStack types don't expose `tag` even though it works at runtime.
type WithHtmlProps<T> = T & {
  tag?: string;
  animation?: string;
  src?: string;
  title?: string;
  sandbox?: string;
  allowFullScreen?: boolean;
};
const PlayButtonEl = PlayButton as React.ComponentType<
  WithHtmlProps<React.ComponentProps<typeof PlayButton>>
>;

export function HomePresentation() {
  const { presentationVideoId, appName } = appConfig;
  const { messages } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const sectionRef = useScrollReveal<HTMLDivElement>();
  const homeCopy = messages.home ?? {};

  const handlePlayClick = () => setIsPlaying(true);

  const handlePlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsPlaying(true);
    }
  };

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
    <PresentationSection
      data-testid="presentation-section"
      ref={sectionRef as React.RefObject<never>}
    >
      <SectionHeader data-reveal data-reveal-delay="1">
        <SectionTitle>{sectionTitle}</SectionTitle>
        <SectionSubtitle>{sectionSubtitle}</SectionSubtitle>
      </SectionHeader>
      <VideoContainer data-reveal data-reveal-delay="2">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${presentationVideoId}?autoplay=1&rel=0&controls=1&mute=0&partitioned=1&widget_referrer=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
            allowFullScreen
            title="Arcadeum Trailer"
            sandbox="allow-scripts allow-same-origin allow-popups"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
          />
        ) : (
          <VideoPlaceholder
            onClick={handlePlayClick}
            data-testid="video-placeholder"
          >
            <Image
              src="/images/home/video-cover.png"
              alt="Arcadeum Trailer Illustration"
              fill
              priority
              data-testid="video-thumbnail"
              style={{ objectFit: 'cover', opacity: 0.85 }}
            />
            <PlaceholderOverlay />
            <PulseRing className="pulse-ring" />
            <PlayButtonEl
              role="button"
              tabIndex={0}
              animation="medium"
              onClick={handlePlayClick}
              onKeyDown={handlePlayKeyDown}
              aria-label="Play video"
              data-testid="play-btn"
            >
              <YStack marginLeft={6}>
                <svg viewBox="0 0 24 24" width={38} height={38} fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </YStack>
            </PlayButtonEl>
          </VideoPlaceholder>
        )}
      </VideoContainer>
    </PresentationSection>
  );
}
