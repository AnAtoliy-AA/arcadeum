import { HydratedDocument, Model, Types } from 'mongoose';
import { User } from '../src/auth/schemas/user.schema';

/** Deterministic ObjectIds for integration tests — same IDs every run. */
export const TEST_IDS = {
  users: {
    alpha: new Types.ObjectId('665f1a000000000000000001'),
    beta: new Types.ObjectId('665f1a000000000000000002'),
    gamma: new Types.ObjectId('665f1a000000000000000003'),
    delta: new Types.ObjectId('665f1a000000000000000004'),
    epsilon: new Types.ObjectId('665f1a000000000000000005'),
  },
} as const;

const USER_SEEDS = [
  { id: TEST_IDS.users.alpha, name: 'alpha' },
  { id: TEST_IDS.users.beta, name: 'beta' },
  { id: TEST_IDS.users.gamma, name: 'gamma' },
  { id: TEST_IDS.users.delta, name: 'delta' },
  { id: TEST_IDS.users.epsilon, name: 'epsilon' },
];

let userIndex = 0;

/**
 * Creates a user with a deterministic ID and sequential username.
 * Pass `userModel` and optional overrides.
 */
export async function createTestUser(
  userModel: Model<User>,
  overrides: Partial<User> = {},
): Promise<{ id: string; doc: HydratedDocument<User> }> {
  const seed = USER_SEEDS[userIndex % USER_SEEDS.length];
  userIndex++;

  const doc = await userModel.create({
    _id: seed.id,
    email: `test-${seed.name}@test.com`,
    passwordHash: 'hash',
    username: `test_${seed.name}`,
    usernameNormalized: `test_${seed.name}`,
    coins: 0,
    gems: 0,
    blockedUsers: [],
    ...overrides,
  });

  return { id: doc._id.toHexString(), doc };
}

/** Reset the user counter between test suites if needed. */
export function resetTestUsers(): void {
  userIndex = 0;
}
