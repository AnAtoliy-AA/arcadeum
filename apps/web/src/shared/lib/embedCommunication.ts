export interface EmbedReadyMessage {
  type: 'ready';
}

export interface EmbedGameOverMessage {
  type: 'gameOver';
  result: 'won' | 'lost' | 'draw';
  score?: number;
}

export interface EmbedScoreUpdateMessage {
  type: 'scoreUpdate';
  score: number;
}

export interface EmbedConfigureMessage {
  type: 'configure';
  theme?: 'dark' | 'light';
  size?: 'compact' | 'normal';
}

export type EmbedMessage =
  | EmbedReadyMessage
  | EmbedGameOverMessage
  | EmbedScoreUpdateMessage
  | EmbedConfigureMessage;

export function getAllowedEmbedOrigins(
  customOrigins?: Iterable<string>,
): string[] {
  const raw = process.env.NEXT_PUBLIC_EMBED_ALLOWED_ORIGINS ?? '';
  const origins = new Set<string>(
    raw
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  if (typeof window !== 'undefined' && window.location?.origin) {
    origins.add(window.location.origin);
  }

  if (typeof document !== 'undefined' && document.referrer) {
    try {
      const referrerOrigin = new URL(document.referrer).origin;
      if (referrerOrigin) {
        origins.add(referrerOrigin);
      }
    } catch {
      return Array.from(origins);
    }
  }

  if (customOrigins) {
    for (const origin of customOrigins) {
      if (origin) {
        origins.add(origin);
      }
    }
  }

  return Array.from(origins);
}

export function sendEmbedMessage(
  message: EmbedMessage,
  targetOrigin: string = '*',
): void {
  if (typeof window === 'undefined') return;
  window.parent.postMessage(message, targetOrigin);
}

export function onEmbedMessage(
  handler: (message: EmbedConfigureMessage) => void,
  customAllowedOrigins?: Iterable<string>,
): () => void {
  if (typeof window === 'undefined') return () => {};

  const allowedOrigins = getAllowedEmbedOrigins(customAllowedOrigins);

  const listener = (event: MessageEvent) => {
    if (
      event.origin !== window.location.origin &&
      !allowedOrigins.includes(event.origin)
    ) {
      return;
    }

    const data = event.data as Partial<EmbedMessage> | null | undefined;
    if (data?.type === 'configure') {
      handler(data as EmbedConfigureMessage);
    }
  };

  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}

export function isEmbedded(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}
