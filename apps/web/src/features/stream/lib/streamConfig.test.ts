import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getStreamJoinHost,
  getStreamJoinUrl,
  isStreamPath,
  isValidRoomId,
  parseDebug,
  parseGameId,
  parseJoinUrl,
  parseOverlayOptions,
  parseSeconds,
  sanitizeText,
  STREAM_GAME_IDS,
} from './streamConfig';

afterEach(() => vi.unstubAllEnvs());

describe('streamConfig', () => {
  it('defaults the join URL and honours NEXT_PUBLIC_STREAM_JOIN_URL', () => {
    expect(getStreamJoinUrl()).toBe('https://arcadeum.games');
    vi.stubEnv('NEXT_PUBLIC_STREAM_JOIN_URL', 'https://play.example.com/rooms');
    expect(getStreamJoinUrl()).toBe('https://play.example.com/rooms');
    expect(getStreamJoinHost()).toBe('play.example.com');
  });

  it('rejects non-http join URLs', () => {
    vi.stubEnv('NEXT_PUBLIC_STREAM_JOIN_URL', 'javascript:alert(1)');
    expect(getStreamJoinUrl()).toBe('https://arcadeum.games');
    vi.stubEnv('NEXT_PUBLIC_STREAM_JOIN_URL', 'not a url');
    expect(getStreamJoinUrl()).toBe('https://arcadeum.games');
  });

  it('parses debug flags', () => {
    expect(parseDebug('1')).toBe(true);
    expect(parseDebug('true')).toBe(true);
    expect(parseDebug('0')).toBe(false);
    expect(parseDebug(undefined)).toBe(false);
    expect(parseDebug(['1', '0'])).toBe(true);
  });

  it('clamps countdown seconds', () => {
    expect(parseSeconds('15')).toBe(15);
    expect(parseSeconds('-4')).toBe(20);
    expect(parseSeconds('abc')).toBe(20);
    expect(parseSeconds('99999')).toBe(600);
    expect(parseSeconds(undefined, 7)).toBe(7);
  });

  it('only accepts known game ids', () => {
    for (const id of STREAM_GAME_IDS) expect(parseGameId(id)).toBe(id);
    expect(parseGameId('texas_holdem_v1')).toBeNull();
    expect(parseGameId('<script>')).toBeNull();
    expect(parseGameId(undefined)).toBeNull();
  });

  it('sanitises free text', () => {
    expect(sanitizeText('  Bot 1\n wins\t!  ')).toBe('Bot 1 wins !');
    expect(sanitizeText('a'.repeat(200), 10)).toHaveLength(10);
    expect(sanitizeText(undefined)).toBe('');
  });

  it('recognises stream paths with and without a locale', () => {
    expect(isStreamPath('/en/stream/abc')).toBe(true);
    expect(isStreamPath('/ru/stream/idle')).toBe(true);
    expect(isStreamPath('/stream')).toBe(true);
    expect(isStreamPath('/en/streams')).toBe(false);
    expect(isStreamPath('/en/rooms/stream')).toBe(false);
    expect(isStreamPath(null)).toBe(false);
  });

  it('validates room ids', () => {
    expect(isValidRoomId('507f191e810c19729de860ea')).toBe(true);
    expect(isValidRoomId('abc-123_X')).toBe(true);
    expect(isValidRoomId('../etc')).toBe(false);
    expect(isValidRoomId('')).toBe(false);
  });
});

describe('overlay options', () => {
  it('defaults to everything visible with no banner', () => {
    const o = parseOverlayOptions({});
    expect(o.banner).toBe('');
    expect(o.showQr).toBe(true);
    expect(Object.values(o.parts).every(Boolean)).toBe(true);
  });

  it('reads join, qr, banner and hide from the query', () => {
    const o = parseOverlayOptions({
      join: 'https://example.com/play',
      qr: '0',
      banner: 'Join us tonight',
      hide: 'players, cta,bogus',
    });
    expect(o.joinUrl).toBe('https://example.com/play');
    expect(o.showQr).toBe(false);
    expect(o.banner).toBe('Join us tonight');
    expect(o.parts).toMatchObject({ players: false, cta: false, status: true });
  });

  it('rejects non-http join URLs and clamps the banner', () => {
    expect(parseJoinUrl('javascript:alert(1)')).toBeNull();
    expect(parseJoinUrl('x'.repeat(300))).toBeNull();
    expect(
      parseOverlayOptions({ banner: 'a'.repeat(200) }).banner,
    ).toHaveLength(80);
  });
});
