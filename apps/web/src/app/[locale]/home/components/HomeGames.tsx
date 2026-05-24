'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/shared/i18n/context';
import { useScrollReveal } from '@/shared/lib/useScrollReveal';
import { featuredGames } from '../data/games';
import { HomeGameCard } from './HomeGameCard';
import { HomeGameDetailsModal } from './modals/HomeGameDetailsModal';
import { useHomeGamesSlider } from './useHomeGamesSlider';
import { gamesApi } from '@/features/games/api';

interface DetailsState {
  gameId: string | null;
  initialTab: 'rules' | 'info';
}

export default function HomeGames() {
  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};
  const sectionRef = useScrollReveal<HTMLElement>();

  const [comingSoonMap, setComingSoonMap] = useState<Map<string, boolean>>(
    new Map(),
  );

  useEffect(() => {
    let cancelled = false;
    gamesApi
      .getCatalog()
      .then((res) => {
        if (cancelled) return;
        const map = new Map<string, boolean>();
        for (const g of res.games) {
          map.set(g.gameId, g.comingSoon);
        }
        setComingSoonMap(map);
      })
      .catch(() => {
        if (!cancelled) setComingSoonMap(new Map());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    sliderRef,
    canScrollLeft,
    canScrollRight,
    isDragging,
    hasMoved,
    checkScroll,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    scrollBy,
  } = useHomeGamesSlider();

  const [details, setDetails] = useState<DetailsState>({
    gameId: null,
    initialTab: 'rules',
  });

  const openDetails = (gameId: string) => {
    if (hasMoved) return;
    setDetails({ gameId, initialTab: 'rules' });
  };

  const closeDetails = () => setDetails((prev) => ({ ...prev, gameId: null }));

  const showPager = featuredGames.length > 3;

  return (
    <section id="games" ref={sectionRef} className="games-section-main">
      <div
        className="featured-section-header-main"
        data-reveal
        data-reveal-delay="1"
      >
        <div className="featured-section-heading-main">
          <h2 className="section-title-main">
            {homeCopy.gamesTitle ?? 'Featured Games'}
          </h2>
          <p className="section-subtitle-main">
            {homeCopy.gamesSubtitle ??
              'Discover our collection of premium multiplayer games'}
          </p>
        </div>

        {showPager ? (
          <nav
            className="featured-header-pager-main"
            aria-label={homeCopy.gamesPagerLabel ?? 'Featured games carousel'}
          >
            <PagerButton
              direction="left"
              enabled={canScrollLeft}
              onClick={() => scrollBy('left')}
              label={homeCopy.gamesPagerPrev ?? 'Previous game'}
            />
            <PagerButton
              direction="right"
              enabled={canScrollRight}
              onClick={() => scrollBy('right')}
              label={homeCopy.gamesPagerNext ?? 'Next game'}
            />
          </nav>
        ) : null}
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
              <HomeGameCard
                game={game}
                homeCopy={homeCopy}
                onOpenDetails={openDetails}
                comingSoon={comingSoonMap.get(game.id) ?? false}
              />
            </div>
          ))}
        </div>
      </div>

      <HomeGameDetailsModal
        isOpen={!!details.gameId}
        onClose={closeDetails}
        gameId={details.gameId ?? ''}
        initialTab={details.initialTab}
      />
    </section>
  );
}

interface PagerButtonProps {
  direction: 'left' | 'right';
  enabled: boolean;
  onClick: () => void;
  label: string;
}

function PagerButton({ direction, enabled, onClick, label }: PagerButtonProps) {
  const isLeft = direction === 'left';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-testid={isLeft ? 'prev-game-button' : 'next-game-button'}
      disabled={!enabled}
      className="featured-header-pager-btn-main"
    >
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d={isLeft ? 'M15 18l-6-6 6-6' : 'M9 5l6 6-6 6'} />
      </svg>
    </button>
  );
}
