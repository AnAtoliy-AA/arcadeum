'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/app/i18n/LanguageProvider';
import { useTranslation } from '@/shared/lib/useTranslation';
import { routes } from '@/shared/config/routes';
import {
  SectionHeader,
  SectionTitle,
  SectionSubtitle,
} from './styles/Common.styles';
import {
  SliderSection,
  SliderContainer,
  SliderTrack,
  SliderItem,
  SliderControls,
  SliderButton,
  MainGameCard,
  MainGameInfo,
  GameHeaderWrapper,
  StyledGameIcon,
  GameTitle,
  GameDescription,
  StyledGameTags,
  GameTag,
  StyledPlayButton,
  HelpIcon,
  CardFooter,
} from './styles/Games.styles';
import { featuredGames } from '../data/games';
import { HomeGameDetailsModal } from './modals/HomeGameDetailsModal';

export function HomeGames() {
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
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
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
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);

    // Disable smooth scroll and snap during drag for responsiveness
    sliderRef.current.style.scrollBehavior = 'auto';
    sliderRef.current.style.scrollSnapType = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    if (Math.abs(walk) > 5) setHasMoved(true);
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (!sliderRef.current) return;
    setIsDragging(false);

    // Re-enable smooth scroll and snap
    sliderRef.current.style.scrollBehavior = 'smooth';
    sliderRef.current.style.scrollSnapType = 'x mandatory';

    // Check scroll after snap finishes (roughly)
    setTimeout(checkScroll, 100);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 392; // card width (360) + gap (32)
      sliderRef.current.style.scrollBehavior = 'smooth';
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <SliderSection id="games">
      <SectionHeader>
        <SectionTitle>{homeCopy.gamesTitle ?? 'Featured Games'}</SectionTitle>
        <SectionSubtitle>
          {homeCopy.gamesSubtitle ??
            'Discover our collection of premium multiplayer games'}
        </SectionSubtitle>
      </SectionHeader>

      <SliderContainer>
        <SliderTrack
          ref={sliderRef}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          $isDragging={isDragging}
        >
          {featuredGames.map((game) => (
            <SliderItem key={game.id}>
              <MainGameCard $gradient={game.gradient}>
                <MainGameInfo>
                  <GameHeaderWrapper>
                    <StyledGameIcon>{game.emoji}</StyledGameIcon>
                    <GameTitle $gradient={game.gradient}>
                      {t(game.nameKey)}
                    </GameTitle>
                    <HelpIcon
                      onClick={(e) => openDetails(game.id, 'rules', e)}
                      title={homeCopy.showMore ?? 'Show Details'}
                    >
                      ?
                    </HelpIcon>
                  </GameHeaderWrapper>

                  <GameDescription>{t(game.descriptionKey)}</GameDescription>

                  <StyledGameTags>
                    {game.tags.map((tag) => (
                      <GameTag key={tag}>{tag}</GameTag>
                    ))}
                  </StyledGameTags>

                  <CardFooter>
                    <StyledPlayButton
                      href={
                        game.isPlayable
                          ? `${routes.gameCreate}?gameId=${game.id}`
                          : '#'
                      }
                    >
                      {game.isPlayable
                        ? (homeCopy.gamePlayButton ?? 'Play Now')
                        : (homeCopy.gameComingSoon ?? 'Coming Soon')}
                    </StyledPlayButton>
                  </CardFooter>
                </MainGameInfo>
              </MainGameCard>
            </SliderItem>
          ))}
        </SliderTrack>

        <SliderControls>
          <SliderButton
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Previous game"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </SliderButton>
          <SliderButton
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Next game"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 5l6 6-6 6" />
            </svg>
          </SliderButton>
        </SliderControls>
      </SliderContainer>

      <HomeGameDetailsModal
        isOpen={!!detailsState.gameId}
        onClose={() => setDetailsState({ ...detailsState, gameId: null })}
        gameId={detailsState.gameId || ''}
        initialTab={detailsState.initialTab}
      />
    </SliderSection>
  );
}
