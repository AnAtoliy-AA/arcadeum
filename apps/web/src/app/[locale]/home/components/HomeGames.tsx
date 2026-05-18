'use client';

import { useState } from 'react';
import { useLanguage } from '@/shared/i18n/context';
import { useScrollReveal } from '@/shared/lib/useScrollReveal';
import { featuredGames } from '../data/games';
import { HomeGameCard } from './HomeGameCard';
import { HomeGameDetailsModal } from './modals/HomeGameDetailsModal';
import { useHomeGamesSlider } from './useHomeGamesSlider';

interface DetailsState {
  gameId: string | null;
  initialTab: 'rules' | 'info';
}

export default function HomeGames() {
  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};
  const sectionRef = useScrollReveal<HTMLElement>();

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
              <HomeGameCard
                game={game}
                homeCopy={homeCopy}
                onOpenDetails={openDetails}
              />
            </div>
          ))}
        </div>

        <div className="slider-controls-main">
          <SliderArrow
            direction="left"
            enabled={canScrollLeft}
            onClick={() => scrollBy('left')}
          />
          <SliderArrow
            direction="right"
            enabled={canScrollRight}
            onClick={() => scrollBy('right')}
          />
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

interface SliderArrowProps {
  direction: 'left' | 'right';
  enabled: boolean;
  onClick: () => void;
}

function SliderArrow({ direction, enabled, onClick }: SliderArrowProps) {
  const isLeft = direction === 'left';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isLeft ? 'Previous game' : 'Next game'}
      data-testid={isLeft ? 'prev-game-button' : 'next-game-button'}
      disabled={!enabled}
      className="slider-btn-main"
      style={{
        opacity: enabled ? 1 : 0.3,
        pointerEvents: enabled ? 'auto' : 'none',
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
        <path d={isLeft ? 'M15 18l-6-6 6-6' : 'M9 5l6 6-6 6'} />
      </svg>
    </button>
  );
}
