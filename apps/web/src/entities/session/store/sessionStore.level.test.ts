import { describe, expect, it } from 'vitest';
import { useSessionStore } from './sessionStore';

describe('sessionStore level derivation', () => {
  it('derives level from xp when tokens are set', async () => {
    await useSessionStore.getState().setTokens({
      provider: 'local',
      accessToken: 'token',
      xp: 5060,
      level: 1,
    });
    const { snapshot } = useSessionStore.getState();
    expect(snapshot.xp).toBe(5060);
    expect(snapshot.level).toBe(4);
  });
});
