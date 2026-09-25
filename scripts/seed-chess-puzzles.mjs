import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import mongoose from 'mongoose';

const PUZZLES_PATH = join(
  process.cwd(),
  'scripts/data/puzzles/puzzles-all.json',
);
const MONGO_URI =
  process.env.OCI_MONGO_URI ||
  process.env.MONGO_URI ||
  'mongodb://localhost:27017/arcadeum';
const BATCH_SIZE = 1000;

const ChessPuzzleSchema = new mongoose.Schema(
  {
    puzzleId: { type: String, required: true, unique: true },
    fen: { type: String, required: true },
    moves: { type: [String], required: true },
    rating: { type: Number, required: true },
    ratingDeviation: { type: Number, default: 0 },
    themes: { type: [String], default: [] },
    openingTags: { type: [String], default: [] },
    plays: { type: Number, default: 0 },
    solutions: { type: Number, default: 0 },
  },
  { collection: 'chesspuzzles', timestamps: false },
);

async function main() {
  if (!existsSync(PUZZLES_PATH)) {
    process.stderr.write(
      `Puzzles file not found at ${PUZZLES_PATH}. Run "node scripts/fetch-chess-puzzles.mjs" first.\n`,
    );
    process.exit(1);
  }

  const rawData = await readFile(PUZZLES_PATH, 'utf-8');
  const puzzles = JSON.parse(rawData);

  process.stdout.write(
    `Connecting to MongoDB at ${MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}...\n`,
  );
  await mongoose.connect(MONGO_URI);

  const PuzzleModel =
    mongoose.models.ChessPuzzle ||
    mongoose.model('ChessPuzzle', ChessPuzzleSchema);

  process.stdout.write(`Seeding ${puzzles.length} puzzles in batches of ${BATCH_SIZE}...\n`);

  let totalUpserted = 0;
  for (let i = 0; i < puzzles.length; i += BATCH_SIZE) {
    const chunk = puzzles.slice(i, i + BATCH_SIZE);
    const ops = chunk.map((p) => ({
      updateOne: {
        filter: { puzzleId: p.puzzleId },
        update: {
          $set: {
            puzzleId: p.puzzleId,
            fen: p.fen,
            moves: p.moves,
            rating: p.rating,
            ratingDeviation: p.ratingDeviation || 0,
            themes: p.themes || [],
            openingTags: p.openingTags || [],
          },
        },
        upsert: true,
      },
    }));

    const result = await PuzzleModel.bulkWrite(ops, { ordered: false });
    totalUpserted += (result.upsertedCount || 0) + (result.modifiedCount || 0);
    process.stdout.write(
      `Progress: ${Math.min(i + BATCH_SIZE, puzzles.length)}/${puzzles.length} processed\n`,
    );
  }

  process.stdout.write(
    `Successfully seeded ${puzzles.length} puzzles into MongoDB!\n`,
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  process.stderr.write(`Seeding error: ${err.message}\n`);
  process.exit(1);
});
