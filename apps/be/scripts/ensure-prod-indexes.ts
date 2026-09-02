/**
 * Migration: Ensure all indexes exist on prod database.
 *
 * Run with: npx ts-node apps/be/scripts/ensure-prod-indexes.ts
 *
 * MongoDB Atlas disables autoIndex in production, so new indexes added
 * to schemas must be applied manually or via this script.
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_OCI_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_OCI_URI environment variable is required');
  process.exit(1);
}

const INDEXES: Array<{
  db: string;
  collection: string;
  index: Record<string, 1 | -1>;
  name?: string;
  expireAfterSeconds?: number;
  partialFilterExpression?: Record<string, unknown>;
}> = [
  // Chat messages
  { db: 'prod', collection: 'messages', index: { chatId: 1, timestamp: -1 } },
  { db: 'prod', collection: 'chats', index: { users: 1 } },
  { db: 'prod', collection: 'chats', index: { chatId: 1 } },

  // Game sessions
  { db: 'prod', collection: 'gamesessions', index: { status: 1, gameId: 1 } },
  {
    db: 'prod',
    collection: 'gamesessions',
    index: { status: 1, updatedAt: -1 },
  },

  // Game rooms — compound indexes for listing/filtering
  {
    db: 'prod',
    collection: 'gamerooms',
    index: { status: 1, gameId: 1, createdAt: -1 },
    name: 'status_gameId_created',
  },
  {
    db: 'prod',
    collection: 'gamerooms',
    index: { 'participants.userId': 1, updatedAt: -1 },
    name: 'participant_updated',
  },
  {
    db: 'prod',
    collection: 'gamerooms',
    index: { hostId: 1, status: 1, createdAt: -1 },
    name: 'host_status_created',
  },

  // Game replays — player history queries
  {
    db: 'prod',
    collection: 'gamereplays',
    index: { playerIds: 1, createdAt: -1 },
    name: 'player_created',
  },
  {
    db: 'prod',
    collection: 'gamereplays',
    index: { gameId: 1, createdAt: -1 },
    name: 'game_created',
  },

  // Game history hidden — per-user hide records
  {
    db: 'prod',
    collection: 'gamehistoryhiddens',
    index: { userId: 1, roomId: 1 },
    name: 'user_room',
  },

  // Password reset tokens — TTL cleanup
  {
    db: 'prod',
    collection: 'passwordresettokens',
    index: { expiresAt: 1 },
    name: 'expiresAt_ttl',
    expireAfterSeconds: 0,
  },

  // Refresh tokens — TTL cleanup for revoked tokens
  {
    db: 'prod',
    collection: 'refresh_tokens',
    index: { expiresAt: 1 },
    name: 'expiresAt_ttl',
    expireAfterSeconds: 0,
    partialFilterExpression: { revoked: true },
  },

  // Push subscriptions — TTL cleanup for stale subscriptions (90 days)
  {
    db: 'prod',
    collection: 'push_subscriptions',
    index: { lastUsedAt: 1 },
    name: 'lastUsedAt_ttl',
    expireAfterSeconds: 7776000,
  },

  // Notifications — compound indexes
  {
    db: 'prod',
    collection: 'notifications',
    index: { userId: 1, createdAt: -1 },
    name: 'user_created',
  },

  // Leaderboard entries — compound for ranking queries
  {
    db: 'prod',
    collection: 'leaderboardentries',
    index: { leaderboardId: 1, score: -1 },
    name: 'leaderboard_score',
  },

  // Ranking entries — per-game ranking
  {
    db: 'prod',
    collection: 'rankingentries',
    index: { gameId: 1, score: -1 },
    name: 'game_score',
  },
];

async function main() {
  const client = new MongoClient(MONGODB_URI!);
  await client.connect();
  console.log('Connected to MongoDB Atlas');

  for (const { db, collection, index, name, expireAfterSeconds, partialFilterExpression } of INDEXES) {
    const coll = client.db(db).collection(collection);
    try {
      const options: Record<string, unknown> = { name, background: true };
      if (expireAfterSeconds !== undefined) {
        options.expireAfterSeconds = expireAfterSeconds;
      }
      if (partialFilterExpression !== undefined) {
        options.partialFilterExpression = partialFilterExpression;
      }
      await coll.createIndex(index, options);
      console.log(
        `✓ ${db}.${collection} index created: ${JSON.stringify(index)}`,
      );
    } catch (err) {
      // Duplicate key = already exists, which is fine
      if ((err as { code?: number }).code === 86) {
        console.log(
          `• ${db}.${collection} index already exists: ${JSON.stringify(index)}`,
        );
      } else {
        console.error(`✗ ${db}.${collection} failed: ${String(err)}`);
      }
    }
  }

  await client.close();
  console.log('Done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
