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
}> = [
  { db: 'prod', collection: 'messages', index: { chatId: 1, timestamp: -1 } },
  { db: 'prod', collection: 'chats', index: { users: 1 } },
  { db: 'prod', collection: 'chats', index: { chatId: 1 } },
  { db: 'prod', collection: 'gamesessions', index: { status: 1, gameId: 1 } },
  {
    db: 'prod',
    collection: 'gamesessions',
    index: { status: 1, updatedAt: -1 },
  },
];

async function main() {
  const client = new MongoClient(MONGODB_URI!);
  await client.connect();
  console.log('Connected to MongoDB Atlas');

  for (const { db, collection, index, name } of INDEXES) {
    const coll = client.db(db).collection(collection);
    try {
      await coll.createIndex(index, { name, background: true });
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
