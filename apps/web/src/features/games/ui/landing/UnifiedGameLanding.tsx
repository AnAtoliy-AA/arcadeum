import { GameLandingLayout } from './GameLandingLayout';
import { GameLandingHero } from './GameLandingHero';
import { GameHighlightsGrid } from './GameHighlightsGrid';
import { GameHowToPlay } from './GameHowToPlay';
import { GameThemesShowcase } from './GameThemesShowcase';
import { GameRulesSection } from './GameRulesSection';
import { GameStrategySection } from './GameStrategySection';
import { GameFaqSection } from './GameFaqSection';
import { GameRelatedGames } from './GameRelatedGames';
import { GameFinalCta } from './GameFinalCta';
import type { UnifiedGameLandingProps } from './types';

export function UnifiedGameLanding({
  breadcrumbs,
  accentGlow = 'blue',
  hero,
  highlights,
  howToPlay,
  themes,
  rules,
  strategy,
  faq,
  relatedGames,
  finalCta,
  extraSection,
  comingSoon = false,
}: UnifiedGameLandingProps) {
  return (
    <GameLandingLayout breadcrumbs={breadcrumbs} accentGlow={accentGlow}>
      <GameLandingHero
        gameId={hero.gameId}
        title={hero.title}
        eyebrow={hero.eyebrow}
        subtitle={hero.subtitle}
        intro={hero.intro}
        category={hero.category}
        playersBadge={hero.playersBadge}
        durationBadge={hero.durationBadge}
        difficultyBadge={hero.difficultyBadge}
        chips={hero.chips}
        ctaQuickplayLabel={hero.ctaQuickplayLabel}
        ctaQuickplayErrorLabel={hero.ctaQuickplayErrorLabel}
        ctaPlayHumanLabel={hero.ctaPlayHumanLabel}
        ctaPlayHumanErrorLabel={hero.ctaPlayHumanErrorLabel}
        browseRoomsLabel={hero.browseRoomsLabel}
        createRoomLabel={hero.createRoomLabel}
        roomsHref={hero.roomsHref}
        createRoomHref={hero.createRoomHref}
        heroVisual={hero.heroVisual}
        comingSoon={comingSoon}
      />

      {highlights ? (
        <GameHighlightsGrid
          title={highlights.title}
          kicker={highlights.kicker}
          items={highlights.items}
        />
      ) : null}

      {howToPlay ? (
        <GameHowToPlay
          title={howToPlay.title}
          kicker={howToPlay.kicker}
          intro={howToPlay.intro}
          steps={howToPlay.steps}
        />
      ) : null}

      {themes && themes.themes && themes.themes.length > 0 ? (
        <GameThemesShowcase
          gameId={themes.gameId ?? hero.gameId}
          title={themes.title}
          kicker={themes.kicker}
          subtitle={themes.subtitle}
          themes={themes.themes}
          baseHref={themes.baseHref}
          createRoomLabel={themes.createRoomLabel}
        />
      ) : null}

      {rules && rules.rules && rules.rules.length > 0 ? (
        <GameRulesSection
          title={rules.title}
          kicker={rules.kicker}
          rules={rules.rules}
          note={rules.note}
        />
      ) : null}

      {strategy && strategy.tips && strategy.tips.length > 0 ? (
        <GameStrategySection
          title={strategy.title}
          kicker={strategy.kicker}
          intro={strategy.intro}
          tips={strategy.tips}
        />
      ) : null}

      {faq && faq.items && faq.items.length > 0 ? (
        <GameFaqSection
          title={faq.title}
          kicker={faq.kicker}
          items={faq.items}
        />
      ) : null}

      {extraSection}

      {relatedGames && relatedGames.games && relatedGames.games.length > 0 ? (
        <GameRelatedGames
          title={relatedGames.title}
          kicker={relatedGames.kicker}
          currentGameSlug={relatedGames.currentGameSlug}
          games={relatedGames.games}
        />
      ) : null}

      <GameFinalCta
        gameId={finalCta.gameId}
        title={finalCta.title}
        subtitle={finalCta.subtitle}
        roomsHref={finalCta.roomsHref}
        gamesHref={finalCta.gamesHref}
        ctaQuickplayLabel={finalCta.ctaQuickplayLabel}
        ctaQuickplayErrorLabel={finalCta.ctaQuickplayErrorLabel}
        ctaPlayHumanLabel={finalCta.ctaPlayHumanLabel}
        ctaPlayHumanErrorLabel={finalCta.ctaPlayHumanErrorLabel}
        browseRoomsLabel={finalCta.browseRoomsLabel}
        backToGamesLabel={finalCta.backToGamesLabel}
        comingSoon={comingSoon}
      />
    </GameLandingLayout>
  );
}
