import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import type { HealthState } from './types';

export interface HealthOptions {
  now?: () => number;
  writeFile?: (file: string, data: string) => void;
  mkdir?: (dir: string, opts: { recursive: boolean }) => void;
  statusFile?: string;
}

/** Mutable status snapshot exposed as JSON (file and/or localhost HTTP). */
export class Health {
  private readonly now: () => number;
  private readonly writeFile: (file: string, data: string) => void;
  private readonly mkdir: (dir: string, opts: { recursive: boolean }) => void;
  private readonly statusFile: string;
  private readonly startedAt: number;
  readonly state: HealthState = {
    state: 'starting',
    currentGame: null,
    gamesPlayed: 0,
    lastRestartReason: null,
    lastRestartAt: null,
    ffmpegFps: 0,
    ffmpegFrames: 0,
    ffmpegRestarts: 0,
    dryRun: true,
    killed: false,
  };

  constructor({
    now = Date.now,
    writeFile = (f, d) => fs.writeFileSync(f, d),
    mkdir = (d, o) => void fs.mkdirSync(d, o),
    statusFile = '',
  }: HealthOptions = {}) {
    this.now = now;
    this.writeFile = writeFile;
    this.mkdir = mkdir;
    this.statusFile = statusFile;
    this.startedAt = now();
  }

  update(patch: Partial<HealthState>): void {
    Object.assign(this.state, patch);
    this.flush();
  }

  snapshot(): HealthState & { uptimeSec: number; updatedAt: string } {
    return {
      ...this.state,
      uptimeSec: Math.round((this.now() - this.startedAt) / 1000),
      updatedAt: new Date(this.now()).toISOString(),
    };
  }

  flush(): void {
    if (!this.statusFile) return;
    try {
      this.mkdir(path.dirname(this.statusFile), { recursive: true });
      this.writeFile(this.statusFile, JSON.stringify(this.snapshot()));
    } catch {
      // status is best effort
    }
  }

  /** Tiny localhost-only HTTP endpoint. Returns the server (or null). */
  serve(port: number): http.Server | null {
    if (!port) return null;
    const server = http.createServer((_req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(this.snapshot()));
    });
    server.listen(port, '127.0.0.1');
    server.unref();
    return server;
  }
}
