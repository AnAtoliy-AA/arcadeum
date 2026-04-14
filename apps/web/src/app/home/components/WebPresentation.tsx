'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import type { TamaguiElement } from 'tamagui';
import {
  Button,
  ArrowLeftIcon,
  ArrowRightIcon,
  MaximizeIcon,
  MinimizeIcon,
} from '@arcadeum/ui';
import { slides } from '../data/slides';
import {
  PresentationContainer,
  SlideContent,
  ControlsOverlay,
  TopBar,
  BottomBar,
  ProgressBar,
  ProgressSegment,
  SlideCounter,
  NavButtonContainer,
  FullscreenButtonContainer,
} from './styles/WebPresentation.styles';

export function WebPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<TamaguiElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  // Track which slides have been loaded to minimize bandwidth.
  // Initially load current, next (+1, +2), and previous (for loop wrap-around).
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    initial.add(0); // Current
    initial.add(1); // Next
    initial.add(2); // Next + 1
    initial.add(slides.length - 1); // Prev (wrap)
    return initial;
  });

  const updateLoadedSlides = useCallback((index: number) => {
    setLoadedIndices((prev) => {
      const nextIndex = (index + 1) % slides.length;
      const nextNextIndex = (index + 2) % slides.length;
      const prevIndex = (index - 1 + slides.length) % slides.length;

      // Only update state if new indices need to be added
      if (
        prev.has(index) &&
        prev.has(nextIndex) &&
        prev.has(nextNextIndex) &&
        prev.has(prevIndex)
      ) {
        return prev;
      }

      const newSet = new Set(prev);
      newSet.add(index);
      newSet.add(nextIndex);
      newSet.add(nextNextIndex);
      newSet.add(prevIndex);
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

  return (
    <PresentationContainer
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <SlideContent
            key={slide.id}
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
                sizes="(max-width: 1400px) 100vw, 1400px"
                loading={index === currentSlide ? 'eager' : 'lazy'}
                style={{
                  objectFit: 'cover',
                  animation: isActive
                    ? 'scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
                    : 'none',
                }}
              />
            ) : null}
          </SlideContent>
        );
      })}

      <ControlsOverlay>
        <TopBar
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
          }}
        >
          <ProgressBar>
            {slides.map((_, index) => {
              const isActive = index === currentSlide;
              const isViewed = index < currentSlide;
              return (
                <ProgressSegment
                  key={index}
                  onClick={createSlideClickHandler(index)}
                  role="button"
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
          </ProgressBar>
        </TopBar>

        {/* Floating Navigation Buttons (Desktop) */}
        <NavButtonContainer
          opacity={isHovered ? 1 : 0}
          style={{ left: 16, transform: 'translateY(-50%)' }}
        >
          <Button
            variant="glass"
            size="md"
            isActive={false}
            onClick={prevSlide}
            aria-label="Previous slide"
            style={{ borderRadius: '50%' }}
          >
            <ArrowLeftIcon size={24} />
          </Button>
        </NavButtonContainer>

        <NavButtonContainer
          opacity={isHovered ? 1 : 0}
          style={{ right: 16, transform: 'translateY(-50%)' }}
        >
          <Button
            variant="glass"
            size="md"
            isActive={false}
            onClick={nextSlide}
            aria-label="Next slide"
            style={{ borderRadius: '50%' }}
          >
            <ArrowRightIcon size={24} />
          </Button>
        </NavButtonContainer>

        <BottomBar
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
          }}
        >
          <SlideCounter>
            {currentSlide + 1} / {slides.length}
          </SlideCounter>

          <FullscreenButtonContainer>
            <Button
              variant="glass"
              size="sm"
              isActive={false}
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <MinimizeIcon size={20} />
              ) : (
                <MaximizeIcon size={20} />
              )}
            </Button>
          </FullscreenButtonContainer>
        </BottomBar>
      </ControlsOverlay>
    </PresentationContainer>
  );
}
