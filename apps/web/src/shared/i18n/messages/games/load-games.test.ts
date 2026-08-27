import { describe, it, expect } from 'vitest';
import { loadGames } from './load-games';
import type { Locale } from '../../types';

describe('loadGames - Backgammon', () => {
  const locales: Locale[] = ['en', 'es', 'fr', 'ru', 'by'];

  it.each(locales)('loads all rule variants for %s', async (locale) => {
    const bundle = await loadGames(locale);
    expect(bundle).toHaveProperty('backgammon_v1');
    const bg = bundle.backgammon_v1 as Record<string, unknown>;
    expect(bg).toHaveProperty('lobby');
    const lobby = bg.lobby as Record<string, unknown>;
    expect(lobby).toHaveProperty('ruleVariant');
    expect(lobby).toHaveProperty('ruleVariants');

    const ruleVariants = lobby.ruleVariants as Record<
      string,
      { name: string; description: string }
    >;
    expect(ruleVariants).toHaveProperty('standard');
    expect(ruleVariants).toHaveProperty('long');
    expect(ruleVariants).toHaveProperty('hyper');
    expect(ruleVariants).toHaveProperty('tavla');
    expect(ruleVariants).toHaveProperty('nackgammon');
    expect(ruleVariants).toHaveProperty('gulbara');

    expect(ruleVariants.standard.name).toBeTruthy();
    expect(ruleVariants.standard.description).toBeTruthy();
  });
});

describe('loadGames - Go', () => {
  const locales: Locale[] = ['en', 'es', 'fr', 'ru', 'by'];

  it.each(locales)('loads all go_v1 keys for %s', async (locale) => {
    const bundle = await loadGames(locale);
    expect(bundle).toHaveProperty('go_v1');
    const go = bundle.go_v1 as Record<string, unknown>;
    for (const key of [
      'name',
      'description',
      'landing',
      'lobby',
      'status',
      'game',
      'gameOver',
      'rules',
    ]) {
      expect(go).toHaveProperty(key);
    }
    const lobby = go.lobby as Record<string, unknown>;
    expect(lobby).toHaveProperty('boardSize');
    expect(lobby).toHaveProperty('startWithBots');
    const rules = go.rules as Record<string, unknown>;
    expect(rules).toHaveProperty('ko');
    expect(rules).toHaveProperty('scoring');

    const landing = go.landing as Record<string, unknown>;
    const sections = landing.sections as Record<string, string>;
    for (const key of [
      'faqTitle',
      'faqKicker',
      'rulesTitle',
      'rulesKicker',
      'themesKicker',
      'highlightsTitle',
      'highlightsKicker',
      'howToPlayTitle',
      'howToPlayKicker',
      'howToPlayIntro',
      'relatedTitle',
      'relatedKicker',
      'finalCtaTitle',
      'finalCtaSubtitle',
      'backToGames',
      'heroEyebrow',
      'heroIntro',
      'heroCategory',
      'playersBadge',
      'durationBadge',
      'difficultyBadge',
      'chipTerritory',
      'chipKoRule',
      'chipAreaScoring',
      'chipAiBots',
    ]) {
      expect(sections[key]).toBeTruthy();
    }
  });
});
