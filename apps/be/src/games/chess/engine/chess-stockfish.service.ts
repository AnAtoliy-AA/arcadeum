/**
 * Stockfish 19 engine service.
 *
 * Spawns Stockfish 19 (latest stable, released 2026-09-05) as child processes
 * and communicates via UCI protocol over stdin/stdout. This is the standard
 * approach used by production chess servers — native binary is significantly
 * faster than WASM.
 *
 * Engine: Stockfish 19 (SFNNv16 architecture, ~44 Elo over Stockfish 18).
 * Binary path: apps/be/bin/stockfish (gitignored, setup via setup-stockfish.sh).
 * Upgrade: replace binary with newer release, no code changes needed.
 */
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { spawn, type ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { EconomySettingsService } from '../../../economy/economy-settings.service';
import { SyzygyTablebaseService } from './syzygy.service';
import {
  analyzePositionMultiPV as analyzeMultiPV,
  getPuzzleHint as getHint,
  analyzeGame as runAnalyzeGame,
} from './chess-stockfish.helpers';
import type {
  EngineEval,
  GameAnalysisResult,
  AnalyzePositionRequest,
  AnalyzeGameRequest,
  PuzzleHint,
} from './chess-stockfish.types';

interface PendingRequest {
  id: string;
  resolve: (eval_: EngineEval) => void;
  reject: (err: Error) => void;
  deadline: number;
  lines: EngineEval[];
}

interface EngineInstance {
  process: ChildProcess;
  busy: boolean;
  pending: PendingRequest | null;
  ready: boolean;
  buffer: string;
  gamesServed: number;
}

/** Live eval during games — fast, lightweight */
const LIVE_DEPTH = 12;
const LIVE_TIME_MS = 1500;

/** Post-game analysis — thorough, accurate */
const ANALYSIS_DEPTH = 18;
const ANALYSIS_TIME_MS = 3000;

const MAX_DEPTH = 24;
const MAX_TIME_MS = 30000;

@Injectable()
export class ChessStockfishService implements OnModuleDestroy {
  private readonly logger = new Logger(ChessStockfishService.name);
  private readonly instances: EngineInstance[] = [];
  private readonly poolSize: number;
  private readonly binaryPath: string;
  private initialized = false;

  constructor(
    private readonly economy: EconomySettingsService,
    private readonly tablebase: SyzygyTablebaseService,
  ) {
    // 1 instance per container — each handles ~20 analyses/min.
    // Scale via STOCKFISH_POOL_SIZE env var if needed later.
    this.poolSize = parseInt(process.env.STOCKFISH_POOL_SIZE ?? '1', 10);

    // Binary location: Docker installs to /usr/local/bin, local dev uses bin/
    // Note: __dirname in compiled code points to dist/, so go up to project root
    const dockerPath = '/usr/local/bin/stockfish';
    const localPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'bin',
      'stockfish',
    );
    this.binaryPath = fs.existsSync(dockerPath) ? dockerPath : localPath;
  }

  async onModuleInit(): Promise<void> {
    this.logger.log(
      `[Stockfish] onModuleInit called. Binary: ${this.binaryPath}`,
    );
    if (!fs.existsSync(this.binaryPath)) {
      if (process.env.E2E === 'true') {
        this.logger.debug(
          `Stockfish 19 binary not found at ${this.binaryPath} (expected in E2E)`,
        );
      } else {
        this.logger.error(
          `Stockfish 19 binary not found at ${this.binaryPath}. ` +
            'Run: bash apps/be/bin/scripts/setup-stockfish.sh',
        );
      }
      return;
    }

    this.logger.log(
      `Initializing Stockfish 19 engine pool (${this.poolSize} instances)...`,
    );

    for (let i = 0; i < this.poolSize; i++) {
      try {
        const instance = await this.spawnInstance();
        this.instances.push(instance);
      } catch (err) {
        this.logger.error(`Failed to spawn Stockfish instance ${i}: ${err}`);
      }
    }

    this.initialized = this.instances.length > 0;
    this.logger.log(
      `Stockfish 19 pool ready (${this.instances.length} instances)`,
    );
  }

  onModuleDestroy() {
    for (const inst of this.instances) {
      try {
        inst.process.stdin?.write('quit\n');
        inst.process.kill();
      } catch {
        // ignore
      }
    }
    this.instances.length = 0;
  }

  /**
   * Analyze a single position.
   * Used by gateway for live eval (depth 12, ~500ms).
   * Depth 24 only allowed when admin enables stockfish_deep_analysis.
   */
  async analyzePosition(request: AnalyzePositionRequest): Promise<EngineEval> {
    const deepEnabled =
      (await this.economy.getNumber('stockfish_deep_analysis')) === 1;
    const maxAllowed = deepEnabled ? MAX_DEPTH : ANALYSIS_DEPTH;
    const depth = Math.min(request.depth ?? LIVE_DEPTH, maxAllowed);
    const timeMs = Math.min(request.timeMs ?? LIVE_TIME_MS, MAX_TIME_MS);

    return this.sendCommands(
      [`position fen ${request.fen}`, `go depth ${depth} movetime ${timeMs}`],
      timeMs + 10000,
    );
  }

  /**
   * Analyze a single position with multi-PV (returns all alternative lines).
   */
  async analyzePositionMultiPV(
    fen: string,
    depth: number = LIVE_DEPTH,
    timeMs: number = LIVE_TIME_MS,
    pvCount: number = 3,
  ): Promise<
    EngineEval & {
      alternatives: Array<{
        move: string;
        cp: number | null;
        mate: number | null;
        pv: string[];
      }>;
    }
  > {
    return analyzeMultiPV(
      () => this.findFreeInstance(),
      fen,
      depth,
      timeMs,
      pvCount,
    );
  }

  /**
   * Get a puzzle hint: best move + alternatives for the position.
   */
  async getPuzzleHint(fen: string): Promise<PuzzleHint | null> {
    return getHint(
      () => this.findFreeInstance(),
      () => this.isReady(),
      fen,
    );
  }

  /**
   * Analyze a full game from position history.
   * Uses deeper analysis (depth 18, ~3s per position) for accurate results.
   * Also probes tablebase for endgame positions and computes anti-cheat data.
   */
  async analyzeGame(request: AnalyzeGameRequest): Promise<GameAnalysisResult> {
    const deepEnabled =
      (await this.economy.getNumber('stockfish_deep_analysis')) === 1;
    const maxAllowed = deepEnabled ? MAX_DEPTH : ANALYSIS_DEPTH;
    const depth = Math.min(request.depth ?? ANALYSIS_DEPTH, maxAllowed);
    const timeMsPerPly = Math.min(
      request.timeMsPerPly ?? ANALYSIS_TIME_MS,
      MAX_TIME_MS,
    );

    return runAnalyzeGame(
      request,
      (req) => this.analyzePosition(req),
      (fen, d, t, pv) => this.analyzePositionMultiPV(fen, d, t, pv),
      (fen) => this.tablebase.probe(fen),
      depth,
      timeMsPerPly,
    );
  }

  /**
   * Get the best move for a position (used by bot upgrade).
   */
  async getBestMove(
    fen: string,
    depth: number = 20,
    timeMs: number = 5000,
  ): Promise<{ bestMove: string; ponder: string }> {
    const result = await this.sendCommands(
      [`position fen ${fen}`, `go depth ${depth} movetime ${timeMs}`],
      timeMs + 10000,
    );

    return {
      bestMove: result.pv[0] ?? '',
      ponder: result.pv[1] ?? '',
    };
  }

  /**
   * Engine version string.
   */
  getVersion(): string {
    return 'Stockfish 19';
  }

  /**
   * Check if engine pool is ready.
   */
  isReady(): boolean {
    return this.initialized && this.instances.length > 0;
  }

  // ─── Internal ──────────────────────────────────────────────────────

  private spawnInstance(): Promise<EngineInstance> {
    return new Promise((resolve, reject) => {
      const proc = spawn(this.binaryPath, [], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const instance: EngineInstance = {
        process: proc,
        busy: false,
        pending: null,
        ready: false,
        buffer: '',
        gamesServed: 0,
      };

      let initResolve: ((inst: EngineInstance) => void) | null = (inst) =>
        resolve(inst);
      let initReject: ((err: Error) => void) | null = (err) => reject(err);

      proc.stdout?.on('data', (data: Buffer) => {
        instance.buffer += data.toString();
        const lines = instance.buffer.split('\n');
        instance.buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // Handle init sequence
          if (!instance.ready) {
            if (trimmed === 'uciok') {
              proc.stdin?.write('setoption name Threads value 1\n');
              proc.stdin?.write('setoption name Hash value 128\n');
              proc.stdin?.write('setoption name MultiPV value 3\n');
              proc.stdin?.write('isready\n');
            } else if (trimmed === 'readyok') {
              instance.ready = true;
              initResolve?.(instance);
              initResolve = null;
              initReject = null;
            }
            continue;
          }

          // Handle analysis output
          if (trimmed.startsWith('info ')) {
            const eval_ = this.parseInfoLine(trimmed);
            if (eval_ && instance.pending) {
              instance.pending.lines.push(eval_);
              // Check deadline — stop engine if time is up
              if (Date.now() >= instance.pending.deadline) {
                instance.process.stdin?.write('stop\n');
              }
            }
          } else if (trimmed.startsWith('bestmove ')) {
            if (instance.pending) {
              const pending = instance.pending;
              instance.pending = null;
              instance.busy = false;
              instance.gamesServed++;

              if (pending.lines.length > 0) {
                pending.resolve(pending.lines[pending.lines.length - 1]);
              } else {
                const parts = trimmed.split(/\s+/);
                pending.resolve({
                  cp: 0,
                  mate: null,
                  pv: [parts[1] ?? ''],
                  depth: 0,
                  selDepth: 0,
                  nodes: 0,
                  nps: 0,
                  timeMs: 0,
                });
              }
            }
          }
        }
      });

      proc.stderr?.on('data', (data: Buffer) => {
        const msg = data.toString().trim();
        if (msg) this.logger.warn(`Stockfish stderr: ${msg}`);
      });

      proc.on('error', (err) => {
        this.logger.error(`Stockfish process error: ${err.message}`);
        initReject?.(err);
        initResolve = null;
        initReject = null;
        if (instance.pending) {
          instance.pending.reject(err);
          instance.pending = null;
        }
      });

      proc.on('exit', (code) => {
        this.logger.warn(`Stockfish exited with code ${code}`);
        instance.ready = false;
        if (instance.pending) {
          instance.pending.reject(new Error('Stockfish process exited'));
          instance.pending = null;
        }
        // Auto-restart crashed instance
        setTimeout(() => {
          this.logger.log(`Restarting Stockfish instance...`);
          this.spawnInstance()
            .then((newInstance) => {
              const idx = this.instances.indexOf(instance);
              if (idx !== -1) this.instances[idx] = newInstance;
              this.logger.log(`Stockfish instance restarted successfully`);
            })
            .catch((err) => {
              this.logger.error(`Failed to restart Stockfish: ${err}`);
            });
        }, 1000);
      });

      // Start UCI handshake
      proc.stdin?.write('uci\n');

      // Timeout for init
      setTimeout(() => {
        if (!instance.ready) {
          initReject?.(new Error('Stockfish init timeout'));
          initResolve = null;
          initReject = null;
          proc.kill();
        }
      }, 10000);
    });
  }

  private findFreeInstance(): EngineInstance | null {
    for (const inst of this.instances) {
      if (!inst.busy && inst.ready) return inst;
    }
    // Recycle oldest instance if all busy
    const candidates = this.instances.filter((i) => i.ready);
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => a.gamesServed - b.gamesServed)[0];
  }

  private sendCommands(
    commands: string[],
    timeoutMs: number,
  ): Promise<EngineEval> {
    return new Promise((resolve, reject) => {
      const instance = this.findFreeInstance();
      if (!instance) {
        reject(new Error('No Stockfish instances available'));
        return;
      }

      this.logger.log(`[Stockfish] Sending commands: ${commands.join(' | ')}`);

      const lines: EngineEval[] = [];
      const deadline = Date.now() + Math.min(timeoutMs, MAX_TIME_MS + 10000);

      // No timer — deadline is checked when Stockfish outputs each line.
      // This avoids setTimeout/setInterval entirely (CodeQL clean).

      instance.busy = true;
      instance.pending = {
        id: `req-${Date.now()}`,
        resolve,
        reject,
        deadline,
        lines,
      };

      for (const cmd of commands) {
        instance.process.stdin?.write(cmd + '\n');
      }
    });
  }

  private parseInfoLine(line: string): EngineEval | null {
    const parts = line.split(/\s+/);
    const eval_: Partial<EngineEval> = {};

    for (let i = 1; i < parts.length; i++) {
      switch (parts[i]) {
        case 'depth':
          eval_.depth = parseInt(parts[++i] ?? '0', 10);
          break;
        case 'seldepth':
          eval_.selDepth = parseInt(parts[++i] ?? '0', 10);
          break;
        case 'score': {
          const next = parts[i + 1];
          if (next === 'cp') {
            eval_.cp = parseInt(parts[i + 2] ?? '0', 10);
            i += 2;
          } else if (next === 'mate') {
            eval_.mate = parseInt(parts[i + 2] ?? '0', 10);
            i += 2;
          }
          break;
        }
        case 'pv':
          eval_.pv = parts.slice(i + 1);
          break;
        case 'nodes':
          eval_.nodes = parseInt(parts[++i] ?? '0', 10);
          break;
        case 'nps':
          eval_.nps = parseInt(parts[++i] ?? '0', 10);
          break;
        case 'time':
          eval_.timeMs = parseInt(parts[++i] ?? '0', 10);
          break;
      }
    }

    if (eval_.depth === undefined) return null;

    return {
      cp: eval_.cp ?? null,
      mate: eval_.mate ?? null,
      pv: eval_.pv ?? [],
      depth: eval_.depth,
      selDepth: eval_.selDepth ?? 0,
      nodes: eval_.nodes ?? 0,
      nps: eval_.nps ?? 0,
      timeMs: eval_.timeMs ?? 0,
    };
  }
}
