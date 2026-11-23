import { XpSettingsService } from './xp-settings.service';

type SettingsDoc = Partial<{
  winXp: number;
  lossXp: number;
  drawXp: number;
  soloCoefficient: number;
  botCoefficient: number;
}>;

/** In-memory users keyed by id; `xp` is mutated by the fake `$inc`. */
export interface FakeUsers {
  [id: string]: { xp: number } | undefined;
}

/**
 * Builds a REAL XpSettingsService backed by in-memory fake mongoose models,
 * so specs exercise the actual reward math, merge rules and `$inc` write.
 */
export function createRealXpSettings(
  users: FakeUsers,
  settingsDocs: Record<string, SettingsDoc> = {},
): XpSettingsService {
  const settingsModel = {
    findOne: ({ scope }: { scope: string }) => ({
      lean: () => Promise.resolve(settingsDocs[scope] ?? null),
    }),
  };
  const userModel = {
    findOneAndUpdate: (
      filter: { _id: string },
      update: { $inc: { xp: number } },
    ) => ({
      lean: () => {
        const user = users[filter._id];
        if (!user) return Promise.resolve(null);
        user.xp += update.$inc.xp;
        return Promise.resolve({ xp: user.xp });
      },
    }),
  };
  return new XpSettingsService(settingsModel as never, userModel as never);
}
