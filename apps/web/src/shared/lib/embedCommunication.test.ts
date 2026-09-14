import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAllowedEmbedOrigins,
  onEmbedMessage,
  sendEmbedMessage,
  isEmbedded,
} from './embedCommunication';

describe('embedCommunication', () => {
  const originalEnv = process.env.NEXT_PUBLIC_EMBED_ALLOWED_ORIGINS;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_EMBED_ALLOWED_ORIGINS = '';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_EMBED_ALLOWED_ORIGINS = originalEnv;
  });

  it('includes window location origin and env origins in allowed origins', () => {
    process.env.NEXT_PUBLIC_EMBED_ALLOWED_ORIGINS =
      'https://arcadeum.games, https://partner.example.com';
    const origins = getAllowedEmbedOrigins(['https://custom.example.com']);
    expect(origins.includes('https://arcadeum.games')).toBe(true);
    expect(origins.includes('https://partner.example.com')).toBe(true);
    expect(origins.includes('https://custom.example.com')).toBe(true);
  });

  it('handles message from allowed origin', () => {
    const handler = vi.fn();
    const cleanup = onEmbedMessage(handler, ['https://allowed.example.com']);

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://allowed.example.com',
        data: { type: 'configure', theme: 'light', size: 'compact' },
      }),
    );

    expect(handler).toHaveBeenCalledWith({
      type: 'configure',
      theme: 'light',
      size: 'compact',
    });

    cleanup();
  });

  it('ignores message from untrusted origin', () => {
    const handler = vi.fn();
    const cleanup = onEmbedMessage(handler, ['https://allowed.example.com']);

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://untrusted.example.com',
        data: { type: 'configure', theme: 'light' },
      }),
    );

    expect(handler).not.toHaveBeenCalled();

    cleanup();
  });

  it('ignores message with non-configure type', () => {
    const handler = vi.fn();
    const cleanup = onEmbedMessage(handler, ['https://allowed.example.com']);

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://allowed.example.com',
        data: { type: 'ready' },
      }),
    );

    expect(handler).not.toHaveBeenCalled();

    cleanup();
  });

  it('unsubscribes on cleanup', () => {
    const handler = vi.fn();
    const cleanup = onEmbedMessage(handler, ['https://allowed.example.com']);
    cleanup();

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://allowed.example.com',
        data: { type: 'configure', theme: 'dark' },
      }),
    );

    expect(handler).not.toHaveBeenCalled();
  });

  it('sends embed message to parent window', () => {
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');
    sendEmbedMessage({ type: 'ready' });
    expect(postMessageSpy).toHaveBeenCalledWith({ type: 'ready' }, '*');
  });

  it('detects embedded state', () => {
    expect(typeof isEmbedded()).toBe('boolean');
  });
});
