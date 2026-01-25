'use client';

import { useLanguage } from '@/app/i18n/LanguageProvider';
import {
  CARD_VARIANTS,
  EXPANSION_PACK_DETAILS,
} from '@/app/games/create/constants';
import { routes } from '@/shared/config/routes';
import {
  SectionHeader,
  SectionTitle,
  SectionSubtitle,
} from './styles/Common.styles';
import {
  GamesSection,
  GameGroup,
  MainGameCard,
  MainGameInfo,
  GameTitle,
  GameDescription,
  GameTags,
  GameTag,
  GameIcon,
  PlayButton,
  SubSectionTitle,
  SimpleBadge,
  PacksContainer,
  PackBadge,
  PackName,
  PackCount,
} from './styles/Games.styles';

export function HomeGames() {
  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};

  // Main game data
  const mainGame = {
    id: 'critical',
    name: 'Critical',
    description:
      'A strategic card game of survival and sabotage. Be the last player standing by avoiding the Critical Meltdown! Use Defuse cards to save yourself, and Action cards to target opponents.',
    emoji: '💣',
    gradient: 'linear-gradient(135deg, #FF4D4D 0%, #F9CB28 100%)',
    tags: ['Card Game', '3-5 Players', '15m Match', 'Strategy'],
    isPlayable: true,
  };

  // Variants data
  const variants = CARD_VARIANTS.map((variant) => ({
    id: variant.id,
    name: variant.name,
    description: variant.description,
    isPlayable: !variant.disabled,
  }));

  // Expansion packs
  const packs = EXPANSION_PACK_DETAILS.filter((p) => p.available).map(
    (pack) => ({
      id: pack.id,
      name: pack.name,
      count: pack.cards.reduce((sum, c) => sum + c.defaultCount, 0),
    }),
  );

  return (
    <GamesSection>
      <SectionHeader>
        <SectionTitle>{homeCopy.gamesTitle ?? 'Featured Games'}</SectionTitle>
        <SectionSubtitle>
          {homeCopy.gamesSubtitle ??
            'Explore our growing library of tabletop experiences'}
        </SectionSubtitle>
      </SectionHeader>

      <GameGroup>
        {/* Main Game Showcase */}
        <MainGameCard href={routes.games} $gradient={mainGame.gradient}>
          <MainGameInfo>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '0.5rem',
              }}
            >
              <GameIcon style={{ marginBottom: 0, fontSize: '3.5rem' }}>
                {mainGame.emoji}
              </GameIcon>
              <GameTitle>{mainGame.name}</GameTitle>
            </div>

            <GameTags style={{ marginTop: 0, marginBottom: '1rem' }}>
              {mainGame.tags.map((tag) => (
                <GameTag key={tag}>{tag}</GameTag>
              ))}
            </GameTags>

            <GameDescription>{mainGame.description}</GameDescription>

            {/* Expansion Packs List */}
            <div style={{ marginTop: '0.5rem' }}>
              <SubSectionTitle>
                {homeCopy.gameIncludesPacks ?? 'Includes 5 Card Packs:'}
              </SubSectionTitle>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                {packs.map((pack) => (
                  <SimpleBadge key={pack.id}>{pack.name}</SimpleBadge>
                ))}
              </div>

              <SubSectionTitle>
                {homeCopy.gameThemedDecks ?? 'Themed Decks:'}
              </SubSectionTitle>
              <PacksContainer
                style={{ justifyContent: 'flex-start', maxWidth: 'none' }}
              >
                {variants.map((variant) => (
                  <PackBadge
                    key={variant.id}
                    style={{ opacity: variant.isPlayable ? 1 : 0.7 }}
                  >
                    <PackName>{variant.name}</PackName>
                    <PackCount
                      style={{
                        background: variant.isPlayable ? '#10B981' : '#333',
                        color: variant.isPlayable ? 'white' : '#aaa',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      {variant.isPlayable
                        ? (homeCopy.gameAvailableNow ?? 'Available Now')
                        : (homeCopy.gameComingSoon ?? 'Coming Soon')}
                    </PackCount>
                  </PackBadge>
                ))}
              </PacksContainer>
            </div>

            <PlayButton
              as="span"
              style={{
                marginTop: '1rem',
                alignSelf: 'center',
                minWidth: '160px',
              }}
            >
              {homeCopy.gamePlayButton ?? 'Play Now'}
            </PlayButton>
          </MainGameInfo>
        </MainGameCard>
      </GameGroup>
    </GamesSection>
  );
}
