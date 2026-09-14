function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36).slice(0, 6);
}

export const GAME_OG_SLUGS = [
  '2048',
  'backgammon',
  'battleship',
  'cascade',
  'cat-dash',
  'checkers',
  'chess',
  'critical',
  'glimworm',
  'go',
  'hearts',
  'minesweeper',
  'pachisi',
  'sea-battle',
  'solitaire',
  'spades',
  'sudoku',
  'tic-tac-toe',
] as const;

export function buildGameOgRewrites(): Array<{
  source: string;
  destination: string;
}> {
  const rules: Array<{ source: string; destination: string }> = [];
  for (const game of GAME_OG_SLUGS) {
    const hash = djb2Hash(`/[locale]/(app)/games/${game}`);
    rules.push({
      source: `/:locale/games/${game}/opengraph-image`,
      destination: `/:locale/games/${game}/opengraph-image-${hash}`,
    });
    rules.push({
      source: `/:locale/games/${game}/twitter-image`,
      destination: `/:locale/games/${game}/twitter-image-${hash}`,
    });
  }
  return rules;
}
