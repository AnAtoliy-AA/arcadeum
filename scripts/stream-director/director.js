'use strict';

const { Rotation } = require('./rotation');
const { evaluateGame, sessionSignature, isCompleted } = require('./gameClock');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const RESULT_TEXT = {
  finished: 'Game complete',
  timeout: 'Time limit reached',
  stuck: 'Game skipped',
  error: 'Game skipped',
};

/** Contract URLs: /{locale}/stream/{roomId} and /{locale}/stream/idle?... */
function sceneUrl(config, roomId, params = {}) {
  const { baseUrl, locale } = config.web;
  const path = roomId
    ? `/${locale}/stream/${roomId}`
    : `/${locale}/stream/idle`;
  const qs = new URLSearchParams(params).toString();
  return `${baseUrl}${path}${qs ? `?${qs}` : ''}`;
}

class Director {
  constructor({
    config,
    api,
    browser,
    health,
    log,
    alert = async () => {},
    now = Date.now,
    wait = sleep,
    rng,
  }) {
    this.config = config;
    this.api = api;
    this.browser = browser;
    this.health = health;
    this.log = log;
    this.alert = alert;
    this.now = now;
    this.wait = wait;
    this.rotation = new Rotation({ games: config.director.games, rng });
    this.stopped = false;
    this.gamesPlayed = 0;
    this.last = null; // { gameId, result }
    this.consecutiveFailures = 0;
  }

  stop() {
    this.stopped = true;
  }

  /** Watch one game until finished / timeout / stuck / error. Returns verdict. */
  async watchGame({ roomId, game }) {
    const { pollMs, maxApiErrors } = this.config.director;
    const startedAt = this.now();
    let lastChangeAt = startedAt;
    let lastSig = null;
    let errors = 0;
    while (!this.stopped) {
      let completed = false;
      try {
        const info = await this.api.getRoomInfo(roomId);
        completed = isCompleted(info);
        const sig = sessionSignature(info?.session);
        if (sig !== lastSig) {
          lastSig = sig;
          lastChangeAt = this.now();
        }
        errors = 0;
      } catch (err) {
        errors += 1;
        this.log.warn('room poll failed', {
          roomId,
          error: err.message,
          errors,
        });
      }
      const { verdict } = evaluateGame({
        now: this.now(),
        startedAt,
        maxDurationMs: game.maxDurationMs,
        stuckMs: game.stuckMs,
        lastChangeAt,
        completed,
        consecutiveErrors: errors,
        maxErrors: maxApiErrors,
      });
      if (verdict !== 'continue') return verdict;
      await this.wait(pollMs);
    }
    return 'stopped';
  }

  async showIdle(next, seconds) {
    const params = { next: next.id, seconds: String(seconds) };
    if (this.last) {
      params.last = this.last.gameId;
      params.result = this.last.result;
    }
    await this.browser.goto(sceneUrl(this.config, null, params));
    await this.wait(seconds * 1000);
  }

  /** One full cycle: create room, watch, end, return the verdict. */
  async playOne() {
    const { game, theme } = this.rotation.next();
    const moveDelayMs = this.config.director.moveDelayMs || game.moveDelayMs;
    this.health.update({
      state: 'starting-game',
      currentGame: { id: game.id, theme },
    });
    let room;
    try {
      room = await this.api.createAiVsAi({
        gameId: game.id,
        theme,
        moveDelayMs,
        personalities: game.personalities,
      });
    } catch (err) {
      this.log.error('create room failed', {
        gameId: game.id,
        error: err.message,
      });
      this.consecutiveFailures += 1;
      this.last = { gameId: game.id, result: RESULT_TEXT.error };
      if (this.consecutiveFailures === 3) {
        await this.alert(
          'create-failed',
          `Cannot create rooms (${err.message})`,
        );
      }
      return { verdict: 'error', game };
    }

    this.log.info('game started', {
      roomId: room.id,
      gameId: game.id,
      theme,
      moveDelayMs,
    });
    this.health.update({
      state: 'live',
      currentGame: {
        id: game.id,
        roomId: room.id,
        theme,
        startedAt: new Date(this.now()).toISOString(),
      },
    });
    try {
      await this.browser.goto(sceneUrl(this.config, room.id, { lang: 'en' }));
    } catch (err) {
      this.log.error('open scene failed', { error: err.message });
      await this.browser.recycle();
    }

    const verdict = await this.watchGame({ roomId: room.id, game });
    if (verdict === 'stopped') return { verdict, game };
    if (verdict !== 'finished') {
      this.log.warn('abandoning game', {
        roomId: room.id,
        gameId: game.id,
        verdict,
      });
      await this.api.abandonRoom(room.id);
      await this.alert(`skip-${verdict}`, `Skipped ${game.id}: ${verdict}`);
    }
    this.consecutiveFailures =
      verdict === 'finished' ? 0 : this.consecutiveFailures + 1;
    if (this.consecutiveFailures === 5) {
      await this.alert(
        'repeated-failures',
        '5 games in a row did not finish normally',
      );
    }
    this.gamesPlayed += 1;
    this.last = {
      gameId: game.id,
      result: RESULT_TEXT[verdict] || 'Game complete',
    };
    this.health.update({ gamesPlayed: this.gamesPlayed });
    this.log.info('game ended', { roomId: room.id, gameId: game.id, verdict });
    return { verdict, game };
  }

  /** Main loop. Peek at the next game for the idle scene's "up next". */
  async run() {
    const { idleSeconds, recycleBrowserEvery } = this.config.director;
    while (!this.stopped) {
      await this.playOne();
      if (this.stopped) break;
      if (
        recycleBrowserEvery > 0 &&
        this.gamesPlayed % recycleBrowserEvery === 0
      ) {
        await this.browser.recycle();
      }
      // Back off a little when the BE keeps failing so we do not hot-loop.
      if (this.consecutiveFailures > 0) {
        await this.wait(Math.min(60_000, 2000 * 2 ** this.consecutiveFailures));
      }
      this.health.update({ state: 'idle', currentGame: null });
      const upcoming = this.rotation.peek();
      try {
        await this.showIdle(upcoming, idleSeconds);
      } catch (err) {
        this.log.warn('idle scene failed', { error: err.message });
        await this.browser.recycle();
      }
    }
  }
}

module.exports = { Director, sceneUrl, RESULT_TEXT };
