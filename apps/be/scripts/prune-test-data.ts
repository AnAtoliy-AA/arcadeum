import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../web/.env') });

const uris = [
  process.env.MONGODB_OCI_URI,
  process.env.MONGODB_ATLAS_URI,
  'mongodb://admin:test123@localhost:27017/arcadeum?authSource=admin',
].filter((u): u is string => !!u && /^mongodb(\+srv)?:\/\//.test(u));

async function pruneTestData(): Promise<void> {
  const uniqueUris = Array.from(new Set(uris));
  for (const uri of uniqueUris) {
    console.log(`Connecting to: ${uri.replace(/:([^:@]+)@/, ':****@')}`);
    const client = new MongoClient(uri);
    try {
      await client.connect();
    } catch (e) {
      console.warn(`Could not connect to ${uri}: ${(e as Error).message}`);
      continue;
    }

    const adminDb = client.db().admin();
    let dbs;
    try {
      dbs = await adminDb.listDatabases();
    } catch {
      dbs = { databases: [{ name: client.db().databaseName }] };
    }
    console.log(
      `Available databases: ${dbs.databases.map((d) => d.name).join(', ')}`,
    );

    const dbNamesToCheck = dbs.databases
      .map((d) => d.name)
      .filter((n) => !['admin', 'local', 'config'].includes(n));

    for (const dbName of dbNamesToCheck) {
      const db = client.db(dbName);
      const usersCollection = db.collection('users');
      const totalCount = await usersCollection.countDocuments().catch(() => 0);
      console.log(`Database [${dbName}] has ${totalCount} users.`);

      if (totalCount === 0) continue;

      const testUserFilter = {
        role: { $ne: 'admin' },
        $or: [
          {
            email: {
              $regex:
                /@example\.com$|@test\.com$|playwright|\+.*@example\.com|test-user|demo_user|fake|mock/i,
            },
          },
          { username: { $regex: /^(test|e2e|anon_|guest_|bot_|user_)/i } },
        ],
      };

      const testUsers = await usersCollection
        .find(testUserFilter, { projection: { _id: 1, email: 1, username: 1 } })
        .toArray();

      if (testUsers.length === 0) {
        console.log(`[${dbName}] No test users matching criteria.`);
        continue;
      }

      const userIds: ObjectId[] = testUsers.map((u) => u._id as ObjectId);
      const userIdStrings: string[] = userIds.map((id) => id.toString());

      console.log(
        `Found ${testUsers.length} test users to delete in [${dbName}].`,
      );

      const collectionsToClean = [
        { name: 'user_inventory_items', field: 'userId', useObjectId: true },
        { name: 'wallet_ledgers', field: 'userId', useObjectId: false },
        { name: 'payment_notes', field: 'authorUserId', useObjectId: false },
        { name: 'notifications', field: 'userId', useObjectId: false },
        { name: 'friend_requests', field: 'senderId', useObjectId: false },
        { name: 'friend_requests', field: 'receiverId', useObjectId: false },
        { name: 'daily_rewards', field: 'userId', useObjectId: false },
        { name: 'achievements', field: 'userId', useObjectId: false },
      ];

      for (const target of collectionsToClean) {
        try {
          const coll = db.collection(target.name);
          const queryValues = target.useObjectId ? userIds : userIdStrings;
          const res = await coll.deleteMany({
            [target.field]: { $in: queryValues },
          });
          if (res.deletedCount > 0) {
            console.log(
              `✓ Deleted ${res.deletedCount} records from ${target.name}`,
            );
          }
        } catch {
          // Ignored for non-existing collections
        }
      }

      const deletedUsersResult = await usersCollection.deleteMany({
        _id: { $in: userIds },
      });
      console.log(
        `✓ Successfully deleted ${deletedUsersResult.deletedCount} test users from [${dbName}] users collection.`,
      );

      const remainingUsers = await usersCollection.countDocuments();
      console.log(`Remaining users count in [${dbName}]: ${remainingUsers}`);
    }

    await client.close();
  }
}

pruneTestData().catch((err: unknown) => {
  console.error('Failed to prune test data:', err);
  process.exit(1);
});
