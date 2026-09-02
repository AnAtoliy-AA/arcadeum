import { randomBytes } from 'crypto';
import type { Model } from 'mongoose';
import type { GameRoom } from '../schemas/game-room.schema';

export async function generateUniqueInviteCode(
  roomModel: Model<GameRoom>,
): Promise<string> {
  let code: string;
  let exists = true;
  while (exists) {
    code = randomBytes(4).toString('hex').toUpperCase();
    const existing = await roomModel.findOne({ inviteCode: code }).lean().exec();
    exists = !!existing;
  }
  return code!;
}
