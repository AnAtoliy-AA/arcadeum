import { GlimwormStateStore } from './glimworm.state';

describe('GlimwormStateStore', () => {
  it('creates, retrieves, and removes sessions', () => {
    const store = new GlimwormStateStore();
    const session = store.create({
      roomId: 'r1',
      hostUserId: 'u1',
      variant: 'battle_royale',
      powerupsEnabled: false,
    });
    expect(store.get('r1')).toBe(session);
    expect(store.list()).toHaveLength(1);
    store.remove('r1');
    expect(store.get('r1')).toBeUndefined();
  });

  it('returns undefined for unknown rooms', () => {
    const store = new GlimwormStateStore();
    expect(store.get('nope')).toBeUndefined();
  });
});
