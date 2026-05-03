import { describe, it, expect } from 'vitest';
import { routes } from './routes';

describe('routes config', () => {
  it('has correct static routes', () => {
    expect(routes.home).toBe('/');
    expect(routes.auth).toBe('/auth');
    expect(routes.settings).toBe('/settings');
    expect(routes.chat).toBe('/chat');
  });

  it('generates dynamic routes correctly', () => {
    expect(routes.gameDetail('123')).toBe('/games/123');
    expect(routes.gameRoom('abc')).toBe('/games/rooms/abc');
    expect(routes.chatDetail('chat-1')).toBe('/chat/chat-1');
  });
});
