'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  IconButton,
  MaximizeIcon,
  MinimizeIcon,
} from '@arcadeum/ui';
import { slides } from '../data/slides';

const NAV_BUTTON_WRAPPER =
  'pointer-events-auto absolute top-1/2 z-20 -translate-y-1/2 opacity-100 transition-[opacity,transform] duration-[300ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] hover:scale-[1.1] hover:opacity-100 min-[1151px]:opacity-0 group-hover:min-[1151px]:opacity-100';

export function WebPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Track which slides have been loaded to minimize bandwidth.
  // Initial set covers current + next so the first nav click is instant on
  // both mobile and desktop. Further indices are added by updateLoadedSlides
  // (mobile: only ahead; desktop: ahead + behind for back-button).
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(
    () => new Set([0, 1]),
  );

  const updateLoadedSlides = useCallback((index: number) => {
    setLoadedIndices((prev) => {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const nextIndex = (index + 1) % slides.length;
      const prevIndex = (index - 1 + slides.length) % slides.length;
      const target = isMobile
        ? [index, nextIndex]
        : [index, nextIndex, prevIndex];

      if (target.every((i) => prev.has(i))) {
        return prev;
      }

      const newSet = new Set(prev);
      target.forEach((i) => newSet.add(i));
      return newSet;
    });
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const next = (prev + 1) % slides.length;
      updateLoadedSlides(next);
      return next;
    });
  }, [updateLoadedSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const previous = (prev - 1 + slides.length) % slides.length;
      updateLoadedSlides(previous);
      return previous;
    });
  }, [updateLoadedSlides]);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlide(index);
      updateLoadedSlides(index);
    },
    [updateLoadedSlides],
  );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      (containerRef.current as HTMLElement | null)
        ?.requestFullscreen()
        .catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault(); // Prevent page scroll
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextSlide, prevSlide]);

  const createSlideClickHandler = useCallback(
    (index: number) => () => {
      goToSlide(index);
    },
    [goToSlide],
  );

  const createSlideKeyDownHandler = useCallback(
    (index: number) => (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToSlide(index);
      }
    },
    [goToSlide],
  );

  return (
    <div
      ref={containerRef}
      className="presentation-container group relative aspect-[16/9] min-h-[200px] w-full self-stretch overflow-hidden rounded-[24px] border border-border-color bg-background shadow-[rgba(0,0,0,0.6)_0px_30px_60px] min-[1151px]:min-h-[500px] min-[1151px]:rounded-[32px]"
    >
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className="absolute inset-0 h-full w-full"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}
            style={{
              opacity: isActive ? 1 : 0,
              visibility: isActive ? 'visible' : 'hidden',
              transition:
                'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.6s',
              zIndex: isActive ? 1 : 0,
            }}
          >
            {loadedIndices.has(index) ? (
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                loading={index === 0 ? 'lazy' : undefined}
                quality={70}
                sizes="(max-width: 768px) 85vw, (max-width: 1200px) 70vw, 800px"
                className={
                  isActive
                    ? 'animate-[scaleIn_0.6s_cubic-bezier(0.22,1,0.36,1)] object-cover'
                    : 'object-cover'
                }
              />
            ) : null}
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between">
        <div className="flex w-full justify-center bg-presentation-top p-4 pointer-events-auto">
          <div className="flex h-[4px] w-full max-w-[600px] items-center gap-1">
            {slides.map((_, index) => {
              const isActive = index === currentSlide;
              const isViewed = index < currentSlide;
              return (
                <div
                  key={index}
                  className="h-full flex-1 cursor-pointer rounded-[2px] transition-[background-color] duration-200"
                  onClick={createSlideClickHandler(index)}
                  onKeyDown={createSlideKeyDownHandler(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to slide ${index + 1}`}
                  style={{
                    background: isActive
                      ? 'var(--accent, #81f1ff)'
                      : isViewed
                        ? 'rgba(255,255,255,0.5)'
                        : 'rgba(255,255,255,0.2)',
                    boxShadow: isActive
                      ? '0 0 8px rgba(255,255,255,0.4)'
                      : 'none',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Floating Navigation Buttons (Desktop) */}
        <div className={NAV_BUTTON_WRAPPER} style={{ left: 16 }}>
          <IconButton
            variant="icon glass"
            size="md"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ArrowLeftIcon size={24} />
          </IconButton>
        </div>

        <div className={NAV_BUTTON_WRAPPER} style={{ right: 16 }}>
          <IconButton
            variant="icon glass"
            size="md"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ArrowRightIcon size={24} />
          </IconButton>
        </div>

        <div className="flex items-center justify-between bg-presentation-bottom p-4 pointer-events-auto">
          <div className="rounded-[20px] bg-black/30 px-3 py-1 text-[12px] font-medium text-white/90">
            {currentSlide + 1} / {slides.length}
          </div>

          <div className="pointer-events-auto">
            <IconButton
              variant="icon glass"
              size="md"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <MinimizeIcon size={20} />
              ) : (
                <MaximizeIcon size={20} />
              )}
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
