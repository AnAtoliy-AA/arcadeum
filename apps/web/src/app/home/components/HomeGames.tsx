'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/shared/i18n/context';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useScrollReveal } from '@/shared/lib/useScrollReveal';
import { routes } from '@/shared/config/routes';
import Link from 'next/link';
import { featuredGames } from '../data/games';
import { HomeGameDetailsModal } from './modals/HomeGameDetailsModal';

export default function HomeGames() {
  const { t } = useTranslation();
  const { messages } = useLanguage();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const [detailsState, setDetailsState] = useState<{
    gameId: string | null;
    initialTab: 'rules' | 'info';
  }>({ gameId: null, initialTab: 'rules' });

  const homeCopy = messages.home ?? {};

  const openDetails = (
    id: string,
    tab: 'rules' | 'info',
    e?: React.MouseEvent | React.TouchEvent,
  ) => {
    if (hasMoved) return; // Don't open if we were dragging
    e?.preventDefault();
    e?.stopPropagation();
    setDetailsState({ gameId: id, initialTab: tab });
  };

  const checkScroll = () => {
    if (sliderRef.current) {
      const el = sliderRef.current;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);

    // Disable smooth scroll and snap during drag for responsiveness
    el.style.scrollBehavior = 'auto';
    el.style.scrollSnapType = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const el = sliderRef.current;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    if (Math.abs(walk) > 5) setHasMoved(true);
    el.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    setIsDragging(false);

    // Re-enable smooth scroll and snap
    el.style.scrollBehavior = 'smooth';
    el.style.scrollSnapType = 'x mandatory';

    // Check scroll after snap finishes (roughly)
    setTimeout(checkScroll, 100);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const el = sliderRef.current;
      const scrollAmount = 392; // card width (360) + gap (32)
      el.style.scrollBehavior = 'smooth';
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const sectionRef = useScrollReveal<HTMLElement>();

  const withKeyboardClick =
    (callback: () => void) => (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        callback();
      }
    };

  const handleHelpClick = (gameId: string) => (e: React.MouseEvent) => {
    openDetails(gameId, 'rules', e);
  };

  const handleHelpKeyDown = (gameId: string) =>
    withKeyboardClick(() => openDetails(gameId, 'rules'));

  const handleScrollLeft = () => scroll('left');
  const handleScrollLeftKeyDown = (e: React.KeyboardEvent) =>
    withKeyboardClick(handleScrollLeft)(e);

  const handleScrollRight = () => scroll('right');
  const handleScrollRightKeyDown = (e: React.KeyboardEvent) =>
    withKeyboardClick(handleScrollRight)(e);

  return (
    <section id="games" ref={sectionRef} className="games-section-main">
      <div className="section-header-main" data-reveal data-reveal-delay="1">
        <h2 className="section-title-main">
          {homeCopy.gamesTitle ?? 'Featured Games'}
        </h2>
        <p className="section-subtitle-main">
          {homeCopy.gamesSubtitle ??
            'Discover our collection of premium multiplayer games'}
        </p>
      </div>

      <div className="slider-container-main" data-reveal data-reveal-delay="2">
        <div
          ref={sliderRef}
          className="slider-track-main slider-track"
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: isDragging ? 'none' : 'auto',
          }}
        >
          {featuredGames.map((game) => (
            <div
              key={game.id}
              className="slider-item-main"
              style={{ scrollSnapAlign: 'center' }}
            >
              <div
                data-testid={`game-card-${game.id}`}
                className="game-card-main"
              >
                {/* Gradient hover overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                    pointerEvents: 'none',
                    opacity: 0,
                    background: game.gradient ?? 'transparent',
                    transition: 'opacity 0.2s ease-out',
                  }}
                  className="game-card-overlay"
                />
                <div
                  className="game-info-wrapper"
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--t-space-3)',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  <div className="game-header-main">
                    <span className="game-icon-main">{game.emoji}</span>
                    <h3
                      data-testid={`game-title-${game.id}`}
                      style={{
                        background: game.gradient,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                      className="game-title-main"
                    >
                      {t(game.nameKey)}
                    </h3>
                    <button
                      type="button"
                      onClick={handleHelpClick(game.id)}
                      onKeyDown={handleHelpKeyDown(game.id)}
                      title={homeCopy.showMore ?? 'Show Details'}
                      aria-label={homeCopy.showMore ?? 'Show Details'}
                      data-testid="game-help-button"
                      className="game-help-btn-main"
                    >
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: 'var(--color)',
                        }}
                      >
                        ?
                      </span>
                    </button>
                  </div>

                  <p className="game-description-main">
                    {t(game.descriptionKey)}
                  </p>

                  <div className="game-tags-main">
                    {game.tags.map((tag) => (
                      <span key={tag} className="game-tag-main">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="game-card-footer-main">
                    <Link
                      href={
                        game.isPlayable
                          ? `${routes.gameCreate}?gameId=${game.id}`
                          : '#'
                      }
                      style={{ width: '100%' }}
                      className="home-link-button home-link-button-primary"
                      data-testid="game-play-button"
                      aria-label={`${game.isPlayable ? (homeCopy.gamePlayButton ?? 'Play Now') : (homeCopy.gameComingSoon ?? 'Coming Soon')} ${t(game.nameKey)}`}
                    >
                      {game.isPlayable
                        ? (homeCopy.gamePlayButton ?? 'Play Now')
                        : (homeCopy.gameComingSoon ?? 'Coming Soon')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="slider-controls-main">
          <button
            type="button"
            onClick={handleScrollLeft}
            onKeyDown={handleScrollLeftKeyDown}
            aria-label="Previous game"
            data-testid="prev-game-button"
            disabled={!canScrollLeft}
            className="slider-btn-main"
            style={{
              opacity: canScrollLeft ? 1 : 0.3,
              pointerEvents: canScrollLeft ? 'auto' : 'none',
            }}
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleScrollRight}
            onKeyDown={handleScrollRightKeyDown}
            aria-label="Next game"
            data-testid="next-game-button"
            disabled={!canScrollRight}
            className="slider-btn-main"
            style={{
              opacity: canScrollRight ? 1 : 0.3,
              pointerEvents: canScrollRight ? 'auto' : 'none',
            }}
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 5l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <HomeGameDetailsModal
        isOpen={!!detailsState.gameId}
        onClose={() => setDetailsState({ ...detailsState, gameId: null })}
        gameId={detailsState.gameId || ''}
        initialTab={detailsState.initialTab}
      />
    </section>
  );
}
