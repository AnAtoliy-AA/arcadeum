'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  SlideImage,
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
      containerRef.current?.requestFullscreen().catch(() => {});
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
        <NavButtonContainer $position="left">
          <Button
            variant="glass"
            size="md"
            onClick={prevSlide}
            aria-label="Previous slide"
            style={{ borderRadius: '50%' }}
          >
            <ArrowLeftIcon size={24} />
          </Button>
        </NavButtonContainer>

        <NavButtonContainer $position="right">
          <Button
            variant="glass"
            size="md"
            onClick={nextSlide}
            aria-label="Next slide"
            style={{ borderRadius: '50%' }}
          >
            <ArrowRightIcon size={24} />
          </Button>
        </NavButtonContainer>

        <BottomBar>
          <SlideCounter>
            {currentSlide + 1} / {slides.length}
          </SlideCounter>

          <FullscreenButtonContainer>
            <Button
              variant="glass"
              size="sm"
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
