'use client';

import React, { useState, useRef, useEffect } from 'react';
import { YStack, TamaguiElement } from 'tamagui';
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
  HelpIcon,
  CardFooter,
} from './styles/Games.styles';
import { LinkButton } from '@/shared/ui';
import { featuredGames } from '../data/games';
import { HomeGameDetailsModal } from './modals/HomeGameDetailsModal';

// Tamagui styled YStack types don't expose `tag`/`title` even though they work at runtime.
// These typed aliases add the props for TS without breaking behaviour.
type WithHtmlProps<T> = T & { tag?: string; title?: string };
const SliderButtonEl = SliderButton as React.ComponentType<
  WithHtmlProps<React.ComponentProps<typeof SliderButton>>
>;
const HelpIconEl = HelpIcon as React.ComponentType<
  WithHtmlProps<React.ComponentProps<typeof HelpIcon>>
>;

export function HomeGames() {
  const { t } = useTranslation();
  const { messages } = useLanguage();
  const sliderRef = useRef<TamaguiElement>(null);
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
      const el = sliderRef.current as unknown as HTMLDivElement;
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
    const el = sliderRef.current as unknown as HTMLDivElement;
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
    const el = sliderRef.current as unknown as HTMLDivElement;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    if (Math.abs(walk) > 5) setHasMoved(true);
    el.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (!sliderRef.current) return;
    const el = sliderRef.current as unknown as HTMLDivElement;
    setIsDragging(false);

    // Re-enable smooth scroll and snap
    el.style.scrollBehavior = 'smooth';
    el.style.scrollSnapType = 'x mandatory';

    // Check scroll after snap finishes (roughly)
    setTimeout(checkScroll, 100);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const el = sliderRef.current as unknown as HTMLDivElement;
      const scrollAmount = 392; // card width (360) + gap (32)
      el.style.scrollBehavior = 'smooth';
      el.scrollBy({
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
          className="slider-track"
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            paddingBottom: '3rem',
            paddingTop: '1.5rem',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: isDragging ? 'none' : 'auto',
          }}
        >
          {featuredGames.map((game) => (
            <SliderItem key={game.id} style={{ scrollSnapAlign: 'center' }}>
              <MainGameCard padding="$5" flex={1}>
                {/* Gradient hover overlay replaces $gradient ::before */}
                <YStack
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  zIndex={0}
                  pointerEvents="none"
                  opacity={0}
                  hoverStyle={{ opacity: 0.05 }}
                  style={{ background: game.gradient ?? 'transparent' }}
                />
                <MainGameInfo>
                  <GameHeaderWrapper>
                    <StyledGameIcon>{game.emoji}</StyledGameIcon>
                    <GameTitle
                      style={{
                        background: game.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {t(game.nameKey)}
                    </GameTitle>
                    <HelpIconEl
                      tag="button"
                      onClick={(e: React.MouseEvent) =>
                        openDetails(game.id, 'rules', e)
                      }
                      title={homeCopy.showMore ?? 'Show Details'}
                    >
                      <GameDescription fontSize={14} opacity={1} margin={0}>
                        ?
                      </GameDescription>
                    </HelpIconEl>
                  </GameHeaderWrapper>

                  <GameDescription>{t(game.descriptionKey)}</GameDescription>

                  <StyledGameTags>
                    {game.tags.map((tag) => (
                      <GameTag key={tag}>{tag}</GameTag>
                    ))}
                  </StyledGameTags>

                  <CardFooter>
                    <LinkButton
                      href={
                        game.isPlayable
                          ? `${routes.gameCreate}?gameId=${game.id}`
                          : '#'
                      }
                      fullWidth
                    >
                      {game.isPlayable
                        ? (homeCopy.gamePlayButton ?? 'Play Now')
                        : (homeCopy.gameComingSoon ?? 'Coming Soon')}
                    </LinkButton>
                  </CardFooter>
                </MainGameInfo>
              </MainGameCard>
            </SliderItem>
          ))}
        </SliderTrack>

        <SliderControls>
          <SliderButtonEl
            tag="button"
            onClick={() => scroll('left')}
            aria-label="Previous game"
            opacity={canScrollLeft ? 1 : 0.3}
            pointerEvents={canScrollLeft ? 'auto' : 'none'}
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
          </SliderButtonEl>
          <SliderButtonEl
            tag="button"
            onClick={() => scroll('right')}
            aria-label="Next game"
            opacity={canScrollRight ? 1 : 0.3}
            pointerEvents={canScrollRight ? 'auto' : 'none'}
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
          </SliderButtonEl>
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
