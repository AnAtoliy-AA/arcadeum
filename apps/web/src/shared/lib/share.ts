// Share utility (roadmap 6A). Wraps the Web Share API with a clipboard
// fallback so share CTAs work on every platform. Returns true when the
// share action completed (either via native share or clipboard copy).

import { track } from '@/shared/lib/analytics';

export interface ShareOptions {
  title: string;
  text: string;
  url: string;
  /** Analytics event name — defaults to 'share.link'. */
  event?: string;
}

/**
 * Share a link using the native Web Share API when available, falling back
 * to clipboard copy. Returns `true` on success, `false` when both paths fail.
 */
export async function shareLink(options: ShareOptions): Promise<boolean> {
  const { title, text, url, event = 'share.link' } = options;

  if (typeof navigator === 'undefined') return false;

  // Native share (mobile browsers, some desktop)
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      track(event, { method: 'native', url });
      return true;
    } catch (err) {
      // User cancelled or API error — fall through to clipboard.
      if (err instanceof DOMException && err.name === 'AbortError') {
        return false;
      }
    }
  }

  // Clipboard fallback
  try {
    await navigator.clipboard.writeText(url);
    track(event, { method: 'clipboard', url });
    return true;
  } catch {
    return false;
  }
}

/**
 * Build a challenge share message with the game name and invite URL.
 */
export function buildChallengeShareText(
  gameName: string,
  inviteUrl: string,
): { title: string; text: string; url: string } {
  return {
    title: `Challenge me in ${gameName}!`,
    text: `I challenge you to ${gameName}! Think you can beat me? 🎮`,
    url: inviteUrl,
  };
}

/**
 * Build a generic game result share message.
 */
export function buildResultShareText(
  gameName: string,
  result: 'won' | 'lost' | 'draw',
  inviteUrl: string,
): { title: string; text: string; url: string } {
  const emoji = result === 'won' ? '🏆' : result === 'lost' ? '💀' : '🤝';
  return {
    title: `I ${result === 'won' ? 'won' : result === 'lost' ? 'lost' : 'drew'} at ${gameName}!`,
    text: `${emoji} I just played ${gameName} on Arcadeum! Can you do better?`,
    url: inviteUrl,
  };
}
