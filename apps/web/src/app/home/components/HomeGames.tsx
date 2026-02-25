'use client';

import { useLanguage } from '@/app/i18n/LanguageProvider';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import {
  CARD_VARIANTS,
  EXPANSION_PACK_DETAILS,
} from '@/app/games/create/constants';
import { SEA_BATTLE_VARIANTS } from '@/widgets/SeaBattleGame/lib/constants';
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
  GameTag,
  SubSectionTitle,
  SimpleBadge,
  PackBadge,
  PackName,
  GameHeaderWrapper,
  PacksListWrapper,
  SubsectionWrapper,
  StyledGameIcon,
  StyledGameTags,
  StyledPacksContainer,
  StyledPackCount,
  StyledPlayButton,
} from './styles/Games.styles';

export function HomeGames() {
  const { messages } = useLanguage();
  const { t } = useTranslation();
  const homeCopy = messages.home ?? {};

  // Main game data
  const mainGame = {
    id: 'critical_v1',
    name: t('games.critical_v1.name' as TranslationKey) || 'Critical',
    description:
      t('games.critical_v1.description' as TranslationKey) ||
      'A strategic card game of survival and sabotage. Be the last player standing by avoiding the Critical Meltdown! Use Defuse cards to save yourself, and Action cards to target opponents.',
    emoji: '💣',
    gradient: 'linear-gradient(135deg, #FF4D4D 0%, #F9CB28 100%)',
    tags: [
      t('games.shared.category.cardGame' as TranslationKey) || 'Card Game',
      '3-5 Players',
      '15m Match',
      t('games.shared.tags.strategy' as TranslationKey) || 'Strategy',
    ],
    isPlayable: true,
  };

  const seaBattle = {
    id: 'sea_battle_v1',
    name: t('games.sea_battle_v1.name' as TranslationKey) || 'Sea Battle',
    description:
      t('games.sea_battle_v1.description' as TranslationKey) ||
      "A classic naval combat game modernized with new themes and features. Deploy your fleet, strategize your attacks, and sink your opponent's ships before they sink yours.",
    emoji: '🚢',
    gradient: 'linear-gradient(135deg, #3498db 0%, #1abc9c 100%)',
    tags: [
      t('games.shared.category.boardGame' as TranslationKey) || 'Board Game',
      '2 Players',
      '10m Match',
      t('games.shared.tags.strategy' as TranslationKey) || 'Strategy',
    ],

    isPlayable: true,
  };

  // Variants data
  const variants = CARD_VARIANTS.map((variant) => ({
    id: variant.id,
    name: t(variant.name as TranslationKey) || variant.name,
    description:
      t(variant.description as TranslationKey) || variant.description,
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
        <MainGameCard $gradient={mainGame.gradient}>
          <MainGameInfo>
            <GameHeaderWrapper>
              <StyledGameIcon>{mainGame.emoji}</StyledGameIcon>
              <GameTitle>{mainGame.name}</GameTitle>
            </GameHeaderWrapper>

            <StyledGameTags>
              {mainGame.tags.map((tag) => (
                <GameTag key={tag}>{tag}</GameTag>
              ))}
            </StyledGameTags>

            <GameDescription>{mainGame.description}</GameDescription>

            <SubsectionWrapper>
              <SubSectionTitle>
                {homeCopy.gameIncludesPacks ?? 'Includes 5 Card Packs:'}
              </SubSectionTitle>
              <PacksListWrapper>
                {packs.map((pack) => (
                  <SimpleBadge key={pack.id}>{pack.name}</SimpleBadge>
                ))}
              </PacksListWrapper>

              <SubSectionTitle>
                {homeCopy.gameThemedDecks ?? 'Themed Decks:'}
              </SubSectionTitle>
              <StyledPacksContainer>
                {variants.map((variant) => (
                  <PackBadge
                    key={variant.id}
                    style={{ opacity: variant.isPlayable ? 1 : 0.7 }}
                  >
                    <PackName>{variant.name}</PackName>
                    <StyledPackCount $isPlayable={variant.isPlayable}>
                      {variant.isPlayable
                        ? (homeCopy.gameAvailableNow ?? 'Available Now')
                        : (homeCopy.gameComingSoon ?? 'Coming Soon')}
                    </StyledPackCount>
                  </PackBadge>
                ))}
              </StyledPacksContainer>
            </SubsectionWrapper>

            <StyledPlayButton href={routes.games}>
              {homeCopy.gamePlayButton ?? 'Play Now'}
            </StyledPlayButton>
          </MainGameInfo>
        </MainGameCard>

        <MainGameCard $gradient={seaBattle.gradient}>
          <MainGameInfo>
            <GameHeaderWrapper>
              <StyledGameIcon>{seaBattle.emoji}</StyledGameIcon>
              <GameTitle>{seaBattle.name}</GameTitle>
            </GameHeaderWrapper>

            <StyledGameTags>
              {seaBattle.tags.map((tag) => (
                <GameTag key={tag}>{tag}</GameTag>
              ))}
            </StyledGameTags>

            <GameDescription>{seaBattle.description}</GameDescription>

            <SubsectionWrapper>
              <SubSectionTitle>
                {homeCopy.gameThemedDecks ?? 'Available Themes:'}
              </SubSectionTitle>
              <StyledPacksContainer>
                {SEA_BATTLE_VARIANTS.map((variant) => (
                  <PackBadge key={variant.id}>
                    <PackName>
                      {t(variant.name as TranslationKey) || variant.name}
                    </PackName>
                    <StyledPackCount $isPlayable={true}>
                      {homeCopy.gameAvailableNow ?? 'Available Now'}
                    </StyledPackCount>
                  </PackBadge>
                ))}
              </StyledPacksContainer>
            </SubsectionWrapper>

            <StyledPlayButton href={routes.games}>
              {homeCopy.gamePlayButton ?? 'Play Now'}
            </StyledPlayButton>
          </MainGameInfo>
        </MainGameCard>
      </GameGroup>
    </GamesSection>
  );
}
