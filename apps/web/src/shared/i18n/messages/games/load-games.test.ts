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
