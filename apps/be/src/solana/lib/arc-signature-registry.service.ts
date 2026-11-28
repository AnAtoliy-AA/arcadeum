import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ArcRedeemedSignature,
  type ArcRedemptionKind,
} from '../schemas/arc-redeemed-signature.schema';

export type RedeemOutcome = 'new' | 'repeat';

@Injectable()
export class ArcSignatureRegistry {
  constructor(
    @InjectModel(ArcRedeemedSignature.name)
    private readonly model: Model<ArcRedeemedSignature>,
  ) {}

  /**
   * Claims `signature` for (user, kind, subject). Returns `repeat` when the
   * same user already claimed it for the same subject (an idempotent retry
   * after a crash between claim and delivery); throws when anyone else holds
   * it, for any other feature or subject.
   */
  async redeem(
    signature: string,
    userId: string,
    kind: ArcRedemptionKind,
    subjectId: string,
  ): Promise<RedeemOutcome> {
    const owner = new Types.ObjectId(userId);
    try {
      await this.model.create({
        signature,
        userId: owner,
        kind,
        subjectId,
      });
      return 'new';
    } catch (err) {
      if ((err as { code?: number })?.code !== 11000) throw err;
    }
    const existing = await this.model
      .findOne({ signature: { $eq: signature } })
      .lean();
    if (
      existing &&
      existing.userId.equals(owner) &&
      existing.kind === kind &&
      existing.subjectId === subjectId
    ) {
      return 'repeat';
    }
    throw new ConflictException('arc.signatureAlreadyUsed');
  }
}
