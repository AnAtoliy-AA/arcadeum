import type { Logger } from './types';

/** Last N warnings/errors, safe to show in the admin UI (no URLs, no tokens). */
export class ErrorRing {
  private readonly items: string[] = [];

  constructor(
    private readonly max = 10,
    private readonly now: () => Date = () => new Date(),
  ) {}

  push(message: string): void {
    const line = `${this.now().toISOString().slice(11, 19)} ${redactText(message)}`;
    this.items.push(line.slice(0, 280));
    if (this.items.length > this.max) this.items.shift();
  }

  list(): string[] {
    return [...this.items];
  }
}

/** Strip anything that could leak a target URL or credential. */
export function redactText(text: string): string {
  return text
    .replace(/\b[a-z][a-z0-9+.-]*:\/\/\S+/gi, '[url]')
    .replace(/bearer\s+\S+/gi, 'bearer [redacted]')
    .replace(/(key|token|password|secret)=\S+/gi, '$1=[redacted]');
}

/** Logger decorator: every warn/error also lands in the ring. */
export function withErrorRing(log: Logger, ring: ErrorRing): Logger {
  const note = (msg: string, data?: Record<string, unknown>): void => {
    const err = data && typeof data.error === 'string' ? `: ${data.error}` : '';
    ring.push(`${msg}${err}`);
  };
  return {
    info: (m, d) => log.info(m, d),
    warn: (m, d) => {
      note(m, d);
      log.warn(m, d);
    },
    error: (m, d) => {
      note(m, d);
      log.error(m, d);
    },
  };
}
