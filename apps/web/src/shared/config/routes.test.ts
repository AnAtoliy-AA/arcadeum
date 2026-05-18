import { describe, it, expect } from 'vitest';
import { routes, buildRoutes } from './routes';

describe('routes config', () => {
  it('default-locale routes are en-prefixed', () => {
    expect(routes.home).toBe('/en');
    expect(routes.auth).toBe('/en/auth');
    expect(routes.settings).toBe('/en/settings');
    expect(routes.chat).toBe('/en/chat');
  });

  it('default-locale dynamic routes are en-prefixed', () => {
    expect(routes.gameDetail('123')).toBe('/en/games/123');
    expect(routes.gameRoom('abc')).toBe('/en/games/rooms/abc');
    expect(routes.chatDetail('chat-1')).toBe('/en/chat/chat-1');
  });

  it('buildRoutes(locale) prefixes paths with the given locale', () => {
    const fr = buildRoutes('fr');
    expect(fr.home).toBe('/fr');
    expect(fr.games).toBe('/fr/games');
    expect(fr.gameDetail('99')).toBe('/fr/games/99');

    const ru = buildRoutes('ru');
    expect(ru.settings).toBe('/ru/settings');
    expect(ru.gameRoom('abc')).toBe('/ru/games/rooms/abc');
  });

  it('offline route stays locale-free', () => {
    expect(routes.offline).toBe('/offline');
    expect(buildRoutes('fr').offline).toBe('/offline');
  });
});
