import type { Page } from '@playwright/test';

export const PET_COLLECTION_STORAGE_KEY = 'arcadeum_pet_collection_v2';

export interface SeedPet {
  id: string;
  name: string;
  species: string;
  stage: string;
  theme: string;
  hunger: number;
  happiness: number;
  level: number;
}

export interface SeedCollection {
  pets: SeedPet[];
  activePetId: string;
  gemBalance?: number;
  coinBalance?: number;
  adoptionCount?: number;
  homeCapacity?: number;
  isAtHome?: boolean;
}

/**
 * Builds a complete stored pet. The app validates stored pets strictly (all
 * timestamps present), so partial seeds are silently discarded; keep every
 * field here.
 */
function buildPet(pet: SeedPet, now: number): Record<string, unknown> {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    stage: pet.stage,
    theme: pet.theme,
    stats: {
      hunger: pet.hunger,
      happiness: pet.happiness,
      energy: 80,
      hygiene: 80,
      discipline: 50,
      health: 100,
      weight: 10,
      level: pet.level,
      xp: 0,
    },
    timestamps: {
      bornAt: now,
      lastInteractedAt: now,
      lastFedAt: now,
      lastSleptAt: now,
      lastCleanedAt: now,
      lastTrainedAt: now,
    },
    isSleeping: false,
    poopCount: 0,
    isSick: false,
    careMistakes: 0,
    mood: 'happy',
    inventory: {},
  };
}

/** Pre-seeds the local pet collection (care already confirmed) before load. */
export async function seedPetCollection(
  page: Page,
  collection: SeedCollection,
): Promise<void> {
  const now = Date.now();
  const stored = {
    ...collection,
    pets: collection.pets.map((p) => buildPet(p, now)),
    queuedThemeForNextPet: null,
    presents: [],
    hasConfirmedCare: true,
  };
  // The seed is local-only. Without a pet API stub the signed-in sync pulls
  // the (empty) collection of the real BE for the fake token and replaces the
  // seed, so the widget flips to the guest/empty state. Fail the pull instead:
  // the store stays local. mockPetServer, registered later, takes precedence.
  await page.route('**/arcade-pet/collection**', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: '{}',
      headers: { 'access-control-allow-origin': '*' },
    }),
  );
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [PET_COLLECTION_STORAGE_KEY, JSON.stringify(stored)] as const,
  );
}

export interface MockPetServerOptions {
  /** Result of POST /arcade-pet/collection/action; defaults to success. */
  actionResult?: (action: Record<string, unknown>) => {
    ok: boolean;
    error?: string;
  };
}

/**
 * Plays the role of the pet API for a signed-in (mock session) player so the
 * store becomes server-backed. Returns the recorded actions.
 */
export async function mockPetServer(
  page: Page,
  collection: SeedCollection,
  options: MockPetServerOptions = {},
): Promise<Record<string, unknown>[]> {
  const actions: Record<string, unknown>[] = [];
  const now = Date.now();
  const response = {
    revision: 1,
    gemBalance: 300,
    coinBalance: 50,
    adoptionCount: 1,
    homeCapacity: 1,
    queuedThemeForNextPet: null,
    presents: [],
    hasConfirmedCare: true,
    isAtHome: false,
    dailyStreak: 0,
    lastDailyClaimDay: null,
    claimedMilestones: [],
    ...collection,
    pets: collection.pets.map((p) => buildPet(p, now)),
  };
  // Credentialed cross-origin calls need the exact origin, not '*'.
  const cors = (origin: string | undefined) => ({
    'access-control-allow-origin': origin ?? '*',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'authorization,content-type,x-anonymous-id',
    'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
  });
  const json = (body: unknown, origin: string | undefined) => ({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
    headers: cors(origin),
  });

  await page.route('**/arcade-pet/collection**', async (route) => {
    const request = route.request();
    const origin = request.headers()['origin'];
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors(origin) });
      return;
    }
    if (request.url().endsWith('/action')) {
      const action = request.postDataJSON() as Record<string, unknown>;
      actions.push(action);
      const verdict = options.actionResult?.(action) ?? { ok: true };
      await route.fulfill(
        json(
          verdict.ok
            ? { ok: true, collection: response }
            : { ok: false, error: verdict.error, collection: response },
          origin,
        ),
      );
      return;
    }
    if (request.method() === 'PUT') {
      await route.fulfill(json({ status: 'ok', collection: response }, origin));
      return;
    }
    await route.fulfill(json(response, origin));
  });
  return actions;
}
