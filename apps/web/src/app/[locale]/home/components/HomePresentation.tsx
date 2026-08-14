'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@arcadeum/ui';
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
      className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-8 px-4 py-12 min-[1151px]:px-0 min-[1151px]:py-20"
    >
      <div
        className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-3 px-4"
        data-reveal
        data-reveal-delay="1"
      >
        <h2 className="m-0 text-center text-[32px] font-bold tracking-[-0.5px] text-color">
          {sectionTitle}
        </h2>
        <p className="m-0 mx-auto max-w-[600px] text-center text-[18px] text-color opacity-70">
          {sectionSubtitle}
        </p>
      </div>
      <div
        className="relative w-full max-w-[1000px] overflow-hidden rounded-[24px] border border-border-color bg-black pb-[56.25%]"
        data-reveal
        data-reveal-delay="2"
      >
        {isPlaying ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${presentationVideoId}?autoplay=1&rel=0&controls=1&mute=1&playsinline=1&partitioned=1&widget_referrer=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
            allowFullScreen
            title="Arcadeum Trailer"
            sandbox="allow-scripts allow-same-origin allow-popups"
            allow="autoplay; encrypted-media"
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
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black"
            data-testid="video-placeholder"
            onClick={handlePlayClick}
          >
            <Image
              src="/images/home/video-cover.webp"
              alt="Arcadeum Trailer Illustration"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEwMCIgaGVpZ2h0PSI2MTkiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgZmlsbD0iIzMyMzUzZCIgd2lkdGg9IjExMDAiIGhlaWdodD0iNjE5Ii8+PC9zdmc+"
              data-testid="video-thumbnail"
              style={{ objectFit: 'cover', opacity: 0.85 }}
            />
            <div className="absolute inset-0 z-[1] bg-video-overlay" />
            <div className="absolute z-[1] h-[90px] w-[90px] animate-pulse-ring rounded-full border-[2.5px] border-white/50 pointer-events-none" />
            <Button
              variant="icon glass"
              size="lg"
              className="absolute z-[2] !h-[90px] !w-[90px]"
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
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
