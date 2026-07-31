import { Logger } from '@nestjs/common';
import { Connection, ClientSession } from 'mongoose';

const logger = new Logger('TransactionUtil');

export async function runInTransaction<T>(
  connection: Connection,
  fn: (session: ClientSession | undefined) => Promise<T>,
): Promise<T> {
  try {
    const session = await connection.startSession();
    try {
      let result!: T;
      await session.withTransaction(async () => {
        result = await fn(session);
      });
      return result;
    } finally {
      await session.endSession();
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const errCodeName = (err as Record<string, unknown> | null)?.codeName;

    if (
      errMsg.includes('replica set') ||
      errMsg.includes('Transaction numbers') ||
      errCodeName === 'TransactionReceiverFailedToStart'
    ) {
      logger.warn(
        'MongoDB transactions not supported by the server, falling back to non-transactional execution',
      );
      return fn(undefined);
    }
    throw err;
  }
}
