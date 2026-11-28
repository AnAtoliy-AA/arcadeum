import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SolanaService, type VerifyReason } from '../solana.service';
import { SolanaPayService } from './solana-pay.service';
import {
  ArcSignatureRegistry,
  type RedeemOutcome,
} from './arc-signature-registry.service';
import type { ArcRedemptionKind } from '../schemas/arc-redeemed-signature.schema';

export interface ArcPaymentRequest {
  userId: string;
  signature: string;
  /** Payer wallet. Optional when the payment came through a Solana Pay session. */
  senderAddress?: string;
  expectedAmount: number;
  kind: ArcRedemptionKind;
  /** Package id or item id being bought. */
  subjectId: string;
}

/**
 * Single entry point that turns an on-chain ARC payment into a right to
 * deliver goods exactly once: verifies the transfer, binds it to the user
 * (sender wallet or Solana Pay reference) and claims the signature so it can
 * never pay for a second purchase.
 */
@Injectable()
export class ArcPaymentService {
  constructor(
    private readonly solana: SolanaService,
    private readonly solanaPay: SolanaPayService,
    private readonly registry: ArcSignatureRegistry,
  ) {}

  async verifyAndRedeem(req: ArcPaymentRequest): Promise<RedeemOutcome> {
    const sender = req.senderAddress?.trim() || undefined;
    let requiredReference: string | undefined;
    if (!sender) {
      // No wallet given: the signature must come from this user's own Solana
      // Pay session, otherwise anyone could redeem someone else's deposit.
      requiredReference =
        this.solanaPay.referenceFor(req.userId, req.signature) ?? undefined;
      if (!requiredReference) {
        throw new BadRequestException(`${req.kind}.invalidTransaction`);
      }
    }

    const result = await this.solana.verifyTransactionDetailed(
      req.signature,
      req.expectedAmount,
      { senderAddress: sender, requiredReference },
    );
    if (!result.valid) throw this.toException(req.kind, result.reason);

    return this.registry.redeem(
      req.signature,
      req.userId,
      req.kind,
      req.subjectId,
    );
  }

  private toException(kind: ArcRedemptionKind, reason: VerifyReason) {
    switch (reason) {
      case 'rpc_error':
        return new ServiceUnavailableException(`${kind}.rpcUnavailable`);
      case 'unconfigured':
      case 'treasury_mismatch':
        return new ServiceUnavailableException('arc.notConfigured');
      case 'not_found':
        return new BadRequestException(`${kind}.transactionNotConfirmed`);
      case 'amount_too_low':
        return new BadRequestException(`${kind}.paymentTooLow`);
      default:
        return new BadRequestException(`${kind}.invalidTransaction`);
    }
  }
}
