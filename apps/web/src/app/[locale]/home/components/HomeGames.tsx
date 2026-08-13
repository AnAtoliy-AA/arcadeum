'use client';

import { useState, useEffect, useMemo } from 'react';
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

  const categories = useMemo(() => {
    const cats = new Set(featuredGames.map((g) => g.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const [activeCategory, setActiveCategory] = useState('All');

  const filteredGames = useMemo(() => {
    if (activeCategory === 'All') return featuredGames;
    return featuredGames.filter((g) => g.category === activeCategory);
  }, [activeCategory]);

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
    <section
      id="games"
      ref={sectionRef}
      className="games-section-main relative mx-auto flex w-full max-w-[1400px] flex-col gap-12 py-10 [content-visibility:auto] [contain-intrinsic-size:auto_800px]"
      aria-label={homeCopy.gamesPagerLabel ?? 'Featured games carousel'}
    >
      <div
        className="section-header-main mx-auto flex w-full max-w-[1400px] flex-col items-center gap-3 px-4"
        data-reveal
        data-reveal-delay="1"
      >
        <h2 className="section-title-main m-0 text-center text-[32px] font-bold tracking-[-0.5px] text-color">
          {homeCopy.gamesTitle ?? 'Featured Games'}
        </h2>
        <p className="section-subtitle-main m-0 mx-auto max-w-[600px] text-center text-[18px] text-color opacity-70">
          {homeCopy.gamesSubtitle ??
            'Discover our collection of premium multiplayer games'}
        </p>
      </div>

      <div
        className="category-tabs-main flex flex-wrap gap-2 px-6"
        data-reveal
        data-reveal-delay="2"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`whitespace-nowrap cursor-pointer rounded-full border bg-transparent px-[14px] py-[6px] font-['JetBrains_Mono',ui-monospace,SFMono-Regular,monospace] text-[11px] uppercase tracking-[0.18em] text-text-secondary transition-[border-color,color,background] duration-150 hover:border-glass-border-hover hover:text-color${
              activeCategory === cat
                ? ' category-tab-active-main border-gold bg-[rgba(255,209,102,0.1)] text-gold'
                : ' border-glass-border'
            }`}
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      <div
        className="slider-container-main relative w-full px-6 max-[640px]:px-4"
        data-reveal
        data-reveal-delay="2"
      >
        <div
          ref={sliderRef}
          className="slider-track slider-track-main flex gap-8 overflow-x-auto pb-7 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[640px]:gap-3 max-[640px]:pl-2 max-[640px]:pr-2"
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
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="slider-item-main h-[420px] w-[360px] shrink-0 [scroll-snap-align:center] max-[640px]:h-auto max-[640px]:min-h-[380px] max-[640px]:w-[min(300px,85vw)]"
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

        <div className="slider-controls-main mt-4 flex flex-row justify-center gap-6">
          <SliderArrow
            direction="left"
            enabled={canScrollLeft}
            onClick={() => scrollBy('left')}
            label={homeCopy.gamesPagerPrev ?? 'Previous game'}
          />
          <SliderArrow
            direction="right"
            enabled={canScrollRight}
            onClick={() => scrollBy('right')}
            label={homeCopy.gamesPagerNext ?? 'Next game'}
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
  label: string;
}

function SliderArrow({ direction, enabled, onClick, label }: SliderArrowProps) {
  const isLeft = direction === 'left';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-testid={isLeft ? 'prev-game-button' : 'next-game-button'}
      disabled={!enabled}
      className="relative flex h-[54px] w-[54px] cursor-pointer items-center justify-center overflow-hidden rounded-full border border-glass-border bg-glass-bg text-color transition-[transform,opacity] duration-200 before:absolute before:inset-0 before:z-0 before:bg-primary before:opacity-0 before:transition-opacity before:duration-200 hover:scale-110 hover:border-transparent hover:before:opacity-100 active:scale-95 [&>svg]:relative [&>svg]:z-[1]"
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
