'use strict';

/**
 * Shuffled-bag rotation: every game plays once per cycle in random order, so
 * variety is guaranteed. A new bag never starts with the game that just
 * played (no back-to-back repeats). Themes cycle per game so the same game
 * looks different each time it comes around.
 */
class Rotation {
  /** @param {{games: Array, rng?: () => number}} opts */
  constructor({ games, rng = Math.random }) {
    if (!games || games.length < 2) throw new Error('rotation needs 2+ games');
    this.games = games;
    this.rng = rng;
    this.bag = [];
    this.lastGameId = null;
    this.themeCursor = new Map();
    this.lastTheme = null;
  }

  _refill() {
    const bag = this.games.slice();
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    // Never open a new bag with the game that just finished.
    if (bag[0].id === this.lastGameId) {
      const k = bag.findIndex((g) => g.id !== this.lastGameId);
      [bag[0], bag[k]] = [bag[k], bag[0]];
    }
    this.bag = bag;
  }

  _nextTheme(game) {
    const themes = game.themes;
    let i = this.themeCursor.has(game.id)
      ? this.themeCursor.get(game.id)
      : Math.floor(this.rng() * themes.length);
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
  peek() {
    if (!this.bag.length) this._refill();
    return this.bag[0];
  }

  /** @returns {{game: object, theme: string}} */
  next() {
    if (!this.bag.length) this._refill();
    const game = this.bag.shift();
    const theme = this._nextTheme(game);
    this.lastGameId = game.id;
    this.lastTheme = theme;
    return { game, theme };
  }
}

module.exports = { Rotation };
