import type { GameConfig } from './types';

/**
 * Shuffled-bag rotation: every game plays once per cycle in random order, so
 * variety is guaranteed. A new bag never starts with the game that just
 * played (no back-to-back repeats). Themes cycle per game so the same game
 * looks different each time it comes around.
 */
export class Rotation {
  private games: GameConfig[];
  private bag: GameConfig[] = [];
  private lastGameId: string | null = null;
  private lastTheme: string | null = null;
  private readonly themeCursor = new Map<string, number>();

  constructor(
    games: GameConfig[],
    private readonly rng: () => number = Math.random,
  ) {
    if (!games || games.length < 2) throw new Error('rotation needs 2+ games');
    this.games = games;
  }

  /**
   * Swap the game list live (admin settings). The current bag is dropped so
   * disabled games stop appearing and new weights apply from the next pick;
   * the last game/theme memory is kept so there is no back-to-back repeat.
   */
  setGames(games: GameConfig[]): void {
    if (!games || games.length < 2) throw new Error('rotation needs 2+ games');
    this.games = games;
    this.bag = [];
  }

  private refill(): void {
    // A game with weight N appears N times per bag (more often, same cycle).
    const bag: GameConfig[] = [];
    for (const g of this.games) {
      const copies = Math.max(1, Math.round(g.weight ?? 1));
      for (let c = 0; c < copies; c++) bag.push(g);
    }
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    // Never play the same game back to back, also across duplicate copies.
    let prev = this.lastGameId;
    for (let i = 0; i < bag.length; i++) {
      if (bag[i].id !== prev) {
        prev = bag[i].id;
        continue;
      }
      const k = bag.findIndex((g, idx) => idx > i && g.id !== prev);
      if (k === -1) {
        // Only duplicates of one game are left: drop them rather than repeat.
        bag.splice(i);
        break;
      }
      [bag[i], bag[k]] = [bag[k], bag[i]];
      prev = bag[i].id;
    }
    this.bag = bag.length ? bag : this.games.filter((g) => g.id !== prev);
  }

  private nextTheme(game: GameConfig): string {
    const themes = game.themes;
    let i = this.themeCursor.get(game.id);
    if (i === undefined) i = Math.floor(this.rng() * themes.length);
    let theme = themes[i % themes.length];
    // Avoid the same theme as the previous game when there is a choice.
    if (themes.length > 1 && theme === this.lastTheme) {
      i += 1;
      theme = themes[i % themes.length];
    }
    this.themeCursor.set(game.id, (i + 1) % themes.length);
    return theme;
  }

  /** The game that next() will return (does not consume it). */
  peek(): GameConfig {
    if (!this.bag.length) this.refill();
    return this.bag[0];
  }

  next(): { game: GameConfig; theme: string } {
    if (!this.bag.length) this.refill();
    const game = this.bag.shift() as GameConfig;
    const theme = this.nextTheme(game);
    this.lastGameId = game.id;
    this.lastTheme = theme;
    return { game, theme };
  }
}
