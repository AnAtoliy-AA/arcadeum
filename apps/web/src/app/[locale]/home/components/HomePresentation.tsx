'use client';

import { useState } from 'react';
import Image from 'next/image';
import { appConfig } from '@/shared/config/app-config';
import { useLanguage, formatMessage } from '@/shared/i18n/context';
import { useScrollReveal } from '@/shared/lib/useScrollReveal';

export default function HomePresentation() {
  const { presentationVideoId, appName } = appConfig;
  const { messages } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const sectionRef = useScrollReveal<HTMLElement>();
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
    <section
      id="presentation"
      data-testid="presentation-section"
      ref={sectionRef}
      className="presentation-section-main"
    >
      <div className="section-header-main" data-reveal data-reveal-delay="1">
        <h2 className="section-title-main">{sectionTitle}</h2>
        <p className="section-subtitle-main">{sectionSubtitle}</p>
      </div>
      <div className="video-container-main" data-reveal data-reveal-delay="2">
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
          <div
            className="video-placeholder-main"
            onClick={handlePlayClick}
            data-testid="video-placeholder"
          >
            <Image
              src="/images/home/video-cover.png"
              alt="Arcadeum Trailer Illustration"
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
              data-testid="video-thumbnail"
              style={{ objectFit: 'cover', opacity: 0.85 }}
            />
            <div className="video-overlay-main" />
            <div className="pulse-ring-main" />
            <button
              type="button"
              className="play-btn-main"
              onClick={handlePlayClick}
              onKeyDown={handlePlayKeyDown}
              aria-label="Play video"
              data-testid="play-btn"
            >
              <div style={{ marginLeft: '6px', display: 'flex' }}>
                <svg viewBox="0 0 24 24" width={38} height={38} fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
