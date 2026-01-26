'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { slides } from '../data/slides';
import {
  PresentationContainer,
  SlideContent,
  SlideImage,
  Controls,
  ControlButton,
  Pagination,
  PageDot,
  FullscreenButton,
} from './styles/WebPresentation.styles';

export function WebPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Track which slides have been loaded to minimize bandwidth.
  // Initially load current, next, and previous (for loop wrap-around).
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    initial.add(0); // Current
    initial.add(1); // Next
    initial.add(slides.length - 1); // Prev (wrap)
    return initial;
  });

  const updateLoadedSlides = useCallback((index: number) => {
    setLoadedIndices((prev) => {
      const nextIndex = (index + 1) % slides.length;
      const prevIndex = (index - 1 + slides.length) % slides.length;

      // Only update state if new indices need to be added
      if (prev.has(index) && prev.has(nextIndex) && prev.has(prevIndex)) {
        return prev;
      }

      const newSet = new Set(prev);
      newSet.add(index);
      newSet.add(nextIndex);
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

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    updateLoadedSlides(index);
  };

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

  // Drag/Swipe Logic
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = () => {
    // Optional: Implement visual rubber-banding here if desired
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (dragStart === null) return;

    const dragEnd = e.changedTouches[0].clientX;
    const distance = dragStart - dragEnd;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped Left -> Next
        nextSlide();
      } else {
        // Swiped Right -> Prev
        prevSlide();
      }
    }

    setDragStart(null);
    setIsDragging(false);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientX);
    setIsDragging(true);
    e.preventDefault(); // Prevent default drag behavior
  };

  const onMouseMove = (e: React.MouseEvent) => {
    // Optional: Implement visual rubber-banding here if desired
    if (isDragging) {
      e.preventDefault();
    }
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (dragStart === null) return;

    const dragEnd = e.clientX;
    const distance = dragStart - dragEnd;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    setDragStart(null);
    setIsDragging(false);
  };

  const onMouseLeave = () => {
    if (isDragging) {
      setDragStart(null);
      setIsDragging(false);
    }
  };

  return (
    <PresentationContainer
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
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

      <Controls>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ControlButton onClick={prevSlide} aria-label="Previous slide">
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
          </ControlButton>

          <ControlButton onClick={nextSlide} aria-label="Next slide">
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
          </ControlButton>
        </div>

        <Pagination>
          {slides.map((_, index) => (
            <PageDot
              key={index}
              $isActive={index === currentSlide}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </Pagination>

        <FullscreenButton
          onClick={toggleFullscreen}
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
      </Controls>
    </PresentationContainer>
  );
}
