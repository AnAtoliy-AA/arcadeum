'use client';

import { useState } from 'react';
import Image from 'next/image';
import { YStack } from 'tamagui';
import { appConfig } from '@/shared/config/app-config';
import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { useScrollReveal } from '@/shared/lib/useScrollReveal';
import {
  PresentationSection,
  VideoContainer,
  VideoIframe,
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
type WithHtmlProps<T> = T & { tag?: string; animation?: string; src?: string; title?: string; sandbox?: string; allowFullScreen?: boolean };
const PlayButtonEl = PlayButton as React.ComponentType<WithHtmlProps<React.ComponentProps<typeof PlayButton>>>;
const VideoIframeEl = VideoIframe as React.ComponentType<WithHtmlProps<React.ComponentProps<typeof VideoIframe>>>;

export function HomePresentation() {
  const { presentationVideoId, appName } = appConfig;
  const { messages } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const sectionRef = useScrollReveal<HTMLDivElement>();
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
    <PresentationSection data-testid="presentation-section" ref={sectionRef as any}>
      <SectionHeader data-reveal data-reveal-delay="1">
        <SectionTitle>{sectionTitle}</SectionTitle>
        <SectionSubtitle>{sectionSubtitle}</SectionSubtitle>
      </SectionHeader>
      <VideoContainer data-reveal data-reveal-delay="2">
        {isPlaying ? (
          <VideoIframeEl
            tag="iframe"
            src={`https://www.youtube-nocookie.com/embed/${presentationVideoId}?autoplay=1&rel=0&controls=1&mute=0&partitioned=1&widget_referrer=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
            allowFullScreen
            title="Arcadeum Trailer"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        ) : (
          <VideoPlaceholder onClick={() => setIsPlaying(true)} data-testid="video-placeholder">
            <Image
              src="/images/home/video-cover.png"
              alt="Arcadeum Trailer Illustration"
              fill
              loading="lazy"
              data-testid="video-thumbnail"
              style={{ objectFit: 'cover', opacity: 0.85 }}
            />
            <PlaceholderOverlay />
            {/* Pulse ring replaces ::after */}
            <PulseRing className="pulse-ring" />
            <PlayButtonEl
              tag="button"
              animation="medium"
              onClick={() => setIsPlaying(true)}
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
