'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MaximizeIcon,
  MinimizeIcon,
} from '@arcadeum/ui';
import { slides } from '../data/slides';

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
    <div ref={containerRef} className="presentation-container">
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className="presentation-slide"
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
                priority={index === 0}
                style={{
                  objectFit: 'cover',
                  animation: isActive
                    ? 'scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
                    : 'none',
                }}
              />
            ) : null}
          </div>
        );
      })}

      <div className="presentation-controls">
        <div
          className="presentation-top-bar"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
          }}
        >
          <div className="presentation-progress-bar">
            {slides.map((_, index) => {
              const isActive = index === currentSlide;
              const isViewed = index < currentSlide;
              return (
                <div
                  key={index}
                  className="presentation-progress-segment"
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
        <div
          className="presentation-nav-container presentation-nav-left"
          style={{
            left: 16,
            transform: 'translateY(-50%)',
          }}
        >
          <button
            className="presentation-btn-glass presentation-btn-glass-md"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ArrowLeftIcon size={24} />
          </button>
        </div>

        <div
          className="presentation-nav-container presentation-nav-right"
          style={{
            right: 16,
            transform: 'translateY(-50%)',
          }}
        >
          <button
            className="presentation-btn-glass presentation-btn-glass-md"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ArrowRightIcon size={24} />
          </button>
        </div>

        <div
          className="presentation-bottom-bar"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
          }}
        >
          <div className="presentation-counter">
            {currentSlide + 1} / {slides.length}
          </div>

          <div className="presentation-fullscreen-container">
            <button
              className="presentation-btn-glass presentation-btn-glass-sm"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <MinimizeIcon size={20} />
              ) : (
                <MaximizeIcon size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
