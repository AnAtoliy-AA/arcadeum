import { createRealXpSettings, type FakeUsers } from './xp-test-fakes';

describe('XpSettingsService', () => {
  describe('awardXp', () => {
    it('adds XP atomically and returns the new total', async () => {
      const users: FakeUsers = { u1: { xp: 50 } };
      const svc = createRealXpSettings(users);
      await expect(svc.awardXp('u1', 100)).resolves.toBe(150);
      expect(users.u1?.xp).toBe(150);
    });

    it('throws (visible failure) when the user does not exist', async () => {
      const svc = createRealXpSettings({});
      await expect(svc.awardXp('ghost', 100)).rejects.toThrow(/not found/);
    });

    it('ignores zero, negative and non-finite amounts', async () => {
      const users: FakeUsers = { u1: { xp: 10 } };
      const svc = createRealXpSettings(users);
      await svc.awardXp('u1', 0);
      await svc.awardXp('u1', -5);
      await svc.awardXp('u1', Number.NaN);
      expect(users.u1?.xp).toBe(10);
    });
  });

  describe('settings resolution', () => {
    it('uses defaults when nothing is stored', async () => {
      const svc = createRealXpSettings({});
      await expect(
        svc.getXpReward('chess_v1', 'won', false, false),
      ).resolves.toBe(100);
    });

    it('falls back to global when a game has no override', async () => {
      const svc = createRealXpSettings({}, { global: { winXp: 150 } });
      await expect(
        svc.getXpReward('chess_v1', 'won', false, false),
      ).resolves.toBe(150);
    });

    it('respects a per-game 0 override (does not fall back to global)', async () => {
      const svc = createRealXpSettings(
        {},
        { global: { lossXp: 40 }, chess_v1: { lossXp: 0 } },
      );
      await expect(
        svc.getXpReward('chess_v1', 'lost', false, false),
      ).resolves.toBe(0);
      await expect(
        svc.getXpReward('hearts', 'lost', false, false),
      ).resolves.toBe(40);
    });

    it('a game that overrides only winXp keeps global for the rest', async () => {
      const svc = createRealXpSettings(
        {},
        { global: { lossXp: 33 }, chess_v1: { winXp: 500 } },
      );
      await expect(
        svc.getXpReward('chess_v1', 'won', false, false),
      ).resolves.toBe(500);
      await expect(
        svc.getXpReward('chess_v1', 'lost', false, false),
      ).resolves.toBe(33);
    });
  });
});
