import { Rotation } from './rotation';
import { evaluateGame, isCompleted, sessionSignature } from './gameClock';
import type {
  Alert,
  DirectorApi,
  GameConfig,
  Logger,
  SceneBrowser,
  StreamConfig,
  Verdict,
} from './types';
import type { Health } from './health';

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

export const RESULT_TEXT: Record<string, string> = {
  finished: 'Game complete',
  timeout: 'Time limit reached',
  stuck: 'Game skipped',
  error: 'Game skipped',
};

/** Contract URLs: /{locale}/stream/{roomId} and /{locale}/stream/idle?... */
export function sceneUrl(
  config: Pick<StreamConfig, 'web'>,
  roomId: string | null,
  params: Record<string, string> = {},
): string {
  const { baseUrl, locale } = config.web;
  const path = roomId
    ? `/${locale}/stream/${roomId}`
    : `/${locale}/stream/idle`;
  const qs = new URLSearchParams(params).toString();
  return `${baseUrl}${path}${qs ? `?${qs}` : ''}`;
}

export interface DirectorOptions {
  config: Pick<StreamConfig, 'web' | 'director'>;
  api: DirectorApi;
  browser: SceneBrowser;
  health: Pick<Health, 'update'>;
  log: Logger;
  alert?: Alert;
  now?: () => number;
  wait?: (ms: number) => Promise<void>;
  rng?: () => number;
}

export class Director {
  private readonly config: DirectorOptions['config'];
  private readonly api: DirectorApi;
  private readonly browser: SceneBrowser;
  private readonly health: Pick<Health, 'update'>;
  private readonly log: Logger;
  private readonly alert: Alert;
  private readonly now: () => number;
  private readonly wait: (ms: number) => Promise<void>;
  private readonly rotation: Rotation;
  stopped = false;
  gamesPlayed = 0;
  last: { gameId: string; result: string } | null = null;
  consecutiveFailures = 0;

  constructor(opts: DirectorOptions) {
    this.config = opts.config;
    this.api = opts.api;
    this.browser = opts.browser;
    this.health = opts.health;
    this.log = opts.log;
    this.alert = opts.alert ?? (() => Promise.resolve(false));
    this.now = opts.now ?? Date.now;
    this.wait = opts.wait ?? sleep;
    this.rotation = new Rotation(opts.config.director.games, opts.rng);
  }

  stop(): void {
    this.stopped = true;
  }

  /** Watch one game until finished / timeout / stuck / error. */
  async watchGame({
    roomId,
    game,
  }: {
    roomId: string;
    game: GameConfig;
  }): Promise<Verdict> {
    const { pollMs, maxApiErrors } = this.config.director;
    const startedAt = this.now();
    let lastChangeAt = startedAt;
    let lastSig: string | null = null;
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
          error: (err as Error).message,
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

  private async showIdle(next: GameConfig, seconds: number): Promise<void> {
    const params: Record<string, string> = {
      next: next.id,
      seconds: String(seconds),
    };
    if (this.last) {
      params.last = this.last.gameId;
      params.result = this.last.result;
    }
    await this.browser.goto(sceneUrl(this.config, null, params));
    await this.wait(seconds * 1000);
  }

  /** One full cycle: create room, watch, end, return the verdict. */
  async playOne(): Promise<{ verdict: Verdict; game: GameConfig }> {
    const { game, theme } = this.rotation.next();
    const moveDelayMs = this.config.director.moveDelayMs ?? game.moveDelayMs;
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
      const message = (err as Error).message;
      this.log.error('create room failed', { gameId: game.id, error: message });
      this.consecutiveFailures += 1;
      this.last = { gameId: game.id, result: RESULT_TEXT.error };
      if (this.consecutiveFailures === 3) {
        await this.alert('create-failed', `Cannot create rooms (${message})`);
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
      this.log.error('open scene failed', { error: (err as Error).message });
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
      result: RESULT_TEXT[verdict] ?? 'Game complete',
    };
    this.health.update({ gamesPlayed: this.gamesPlayed });
    this.log.info('game ended', {
      roomId: room.id,
      gameId: game.id,
      verdict,
    });
    return { verdict, game };
  }

  /** Main loop: play, recycle browser every N games, show the idle scene. */
  async run(): Promise<void> {
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
      try {
        await this.showIdle(this.rotation.peek(), idleSeconds);
      } catch (err) {
        this.log.warn('idle scene failed', { error: (err as Error).message });
        await this.browser.recycle();
      }
    }
  }
}
