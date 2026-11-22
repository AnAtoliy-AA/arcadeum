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
import { GameLandingThemeProvider } from './GameLandingThemeContext';
import { GameSpecTable, PlatformComparisonTable } from '@arcadeum/ui';
import { GameSectionNav } from './GameSectionNav';
import type { GameSectionNavItem, UnifiedGameLandingProps } from './types';

export function UnifiedGameLanding({
  breadcrumbs,
  accentGlow = 'blue',
  hero,
  topSection,
  extraNavItems,
  specifications,
  comparison,
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
  const hasThemes = Boolean(themes?.themes && themes.themes.length > 0);
  const hasRules = Boolean(rules?.rules && rules.rules.length > 0);
  const hasStrategy = Boolean(strategy?.tips && strategy.tips.length > 0);
  const hasFaq = Boolean(faq?.items && faq.items.length > 0);
  const hasRelated = Boolean(
    relatedGames?.games && relatedGames.games.length > 0,
  );

  // Page order: Play, How to play, Rules, Highlights, Themes, Strategy,
  // Specs, FAQ, Related, Final CTA. The sticky nav mirrors this order; extra
  // items with placement 'afterPlay' sit right after Play (topSection hubs).
  const extras = extraNavItems ?? [];
  const navItems: GameSectionNavItem[] = [
    { id: 'play', labelKey: 'games.landing.navPlay' },
    ...extras.filter((item) => item.placement === 'afterPlay'),
  ];
  if (howToPlay) {
    navItems.push({
      id: howToPlay.id ?? 'how-to-play',
      labelKey: 'games.landing.navHowToPlay',
    });
  }
  if (hasRules) {
    navItems.push({
      id: rules?.id ?? 'rules',
      labelKey: 'games.landing.navRules',
    });
  }
  if (highlights) {
    navItems.push({
      id: highlights.id ?? 'highlights',
      labelKey: 'games.landing.navHighlights',
    });
  }
  if (hasThemes) {
    navItems.push({
      id: themes?.id ?? 'themes',
      labelKey: 'games.landing.navThemes',
    });
  }
  if (hasStrategy) {
    navItems.push({
      id: strategy?.id ?? 'strategy',
      labelKey: 'games.landing.navStrategy',
    });
  }
  navItems.push(...extras.filter((item) => item.placement !== 'afterPlay'));
  if (hasFaq) {
    navItems.push({ id: faq?.id ?? 'faq', labelKey: 'games.landing.navFaq' });
  }
  if (hasRelated) {
    navItems.push({
      id: relatedGames?.id ?? 'related',
      labelKey: 'games.landing.navRelated',
    });
  }

  return (
    <GameLandingLayout breadcrumbs={breadcrumbs} accentGlow={accentGlow}>
      <GameLandingThemeProvider initialTheme={hero.initialTheme}>
        <GameLandingHero {...hero} comingSoon={comingSoon} />

        <GameSectionNav items={navItems} />

        {topSection}

        {howToPlay ? <GameHowToPlay {...howToPlay} /> : null}

        {hasRules && rules ? <GameRulesSection {...rules} /> : null}

        {highlights ? <GameHighlightsGrid {...highlights} /> : null}

        {hasThemes && themes ? (
          <GameThemesShowcase
            {...themes}
            gameId={themes.gameId ?? hero.gameId}
            comingSoon={comingSoon}
          />
        ) : null}

        {hasStrategy && strategy ? <GameStrategySection {...strategy} /> : null}

        {specifications ? (
          <GameSpecTable
            title={specifications.title}
            kicker={specifications.kicker}
            items={specifications.items}
          />
        ) : null}

        {comparison ? (
          <PlatformComparisonTable
            title={comparison.title}
            kicker={comparison.kicker}
            subtitle={comparison.subtitle}
            columns={comparison.columns}
            rows={comparison.rows}
          />
        ) : null}

        {extraSection}

        {hasFaq && faq ? <GameFaqSection {...faq} /> : null}

        {hasRelated && relatedGames ? (
          <GameRelatedGames {...relatedGames} />
        ) : null}

        <GameFinalCta {...finalCta} comingSoon={comingSoon} />
      </GameLandingThemeProvider>
    </GameLandingLayout>
  );
}
