'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { slides } from '../data/slides';
import {
  PresentationContainer,
  SlideContent,
  SlideImage,
  ControlsOverlay,
  TopBar,
  BottomBar,
  ProgressBar,
  ProgressSegment,
  SlideCounter,
  NavButton,
  FullscreenButton,
} from './styles/WebPresentation.styles';

export function WebPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
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
    <PresentationContainer ref={containerRef}>
      {slides.map((slide, index) => (
        <SlideContent
          key={slide.id}
          $isActive={index === currentSlide}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}
        >
          {loadedIndices.has(index) ? (
            <SlideImage
              src={slide.image}
              alt={slide.title}
              // Keep eager for purely the current one to ensure priority,
              // though strict lazy state handles most of it.
              loading={index === currentSlide ? 'eager' : 'lazy'}
            />
          ) : null}
        </SlideContent>
      ))}

      <ControlsOverlay>
        <TopBar>
          <ProgressBar>
            {slides.map((_, index) => (
              <ProgressSegment
                key={index}
                $isActive={index === currentSlide}
                $isViewed={index < currentSlide}
                onClick={createSlideClickHandler(index)}
                role="button"
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </ProgressBar>
        </TopBar>

        {/* Floating Navigation Buttons (Desktop) */}
        <NavButton
          $position="left"
          onClick={() => {
            prevSlide();
          }}
          aria-label="Previous slide"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </NavButton>

        <NavButton
          $position="right"
          onClick={() => {
            nextSlide();
          }}
          aria-label="Next slide"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </NavButton>

        <BottomBar>
          <SlideCounter>
            {currentSlide + 1} / {slides.length}
          </SlideCounter>

          <FullscreenButton
            onClick={() => {
              toggleFullscreen();
            }}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            )}
          </FullscreenButton>
        </BottomBar>
      </ControlsOverlay>
    </PresentationContainer>
  );
}
