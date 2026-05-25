import { describe, it, expect } from 'vitest';
import { routes, buildRoutes } from './routes';

describe('routes config', () => {
  it('default-locale routes use English slugs', () => {
    expect(routes.home).toBe('/en');
    expect(routes.auth).toBe('/en/auth');
    expect(routes.settings).toBe('/en/settings');
    expect(routes.chat).toBe('/en/chat');
  });

  it('default-locale dynamic routes use English slugs', () => {
    expect(routes.gameDetail('123')).toBe('/en/games/123');
    expect(routes.gameRoom('abc')).toBe('/en/games/rooms/abc');
    expect(routes.chatDetail('chat-1')).toBe('/en/chat/chat-1');
  });

  it('French routes use French top-level slugs', () => {
    const fr = buildRoutes('fr');
    expect(fr.home).toBe('/fr');
    expect(fr.games).toBe('/fr/jeux');
    expect(fr.gameDetail('99')).toBe('/fr/jeux/99');
    expect(fr.settings).toBe('/fr/parametres');
    expect(fr.history).toBe('/fr/historique');
    expect(fr.auth).toBe('/fr/connexion');
    expect(fr.wallet).toBe('/fr/portefeuille');
  });

  it('Spanish routes use Spanish top-level slugs', () => {
    const es = buildRoutes('es');
    expect(es.games).toBe('/es/juegos');
    expect(es.shop).toBe('/es/tienda');
    expect(es.support).toBe('/es/soporte');
  });

  it('Russian routes use ASCII transliteration', () => {
    const ru = buildRoutes('ru');
    expect(ru.settings).toBe('/ru/nastroyki');
    expect(ru.gameRoom('abc')).toBe('/ru/igry/rooms/abc');
    expect(ru.support).toBe('/ru/podderzhka');
  });

  it('Belarusian routes use ASCII transliteration', () => {
    const by = buildRoutes('by');
    expect(by.games).toBe('/by/hulni');
    expect(by.community).toBe('/by/supolnasc');
  });

  it('nested segments stay in English even under translated locales', () => {
    expect(buildRoutes('fr').gameCreate).toBe('/fr/jeux/create');
    expect(buildRoutes('fr').paymentSuccess).toBe('/fr/paiement/success');
    expect(buildRoutes('fr').authCallback).toBe('/fr/connexion/callback');
    expect(buildRoutes('fr').adminUsers).toBe('/fr/admin/users');
  });

  it('offline route stays locale-free', () => {
    expect(routes.offline).toBe('/offline');
    expect(buildRoutes('fr').offline).toBe('/offline');
  });
});
