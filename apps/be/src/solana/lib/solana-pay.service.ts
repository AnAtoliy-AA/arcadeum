import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Keypair } from '@solana/web3.js';
import { createHash } from 'crypto';
import { SolanaService } from '../solana.service';

export interface PaymentRequest {
  sessionId: string;
  solanaPayUrl: string;
  amount: number;
  tokenAddress: string;
  recipient: string;
  reference: string;
}

export interface PaymentStatus {
  status: 'pending' | 'confirmed' | 'failed' | 'expired';
  signature?: string;
  /** Confirmed after the session window closed. */
  late?: boolean;
  /** Machine readable cause when `failed`. */
  reason?: string;
}

interface Session {
  userId: string;
  amount: number;
  tokenAddress: string;
  reference: string;
  createdAt: number;
  signature?: string;
  callback?: (signature: string) => void;
}

const MAX_AMOUNT = 1_000_000_000;

@Injectable()
export class SolanaPayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SolanaPayService.name);
  private readonly sessions = new Map<string, Session>();
  /** Session shown as `expired` after this, but still watched for late payments. */
  private readonly SESSION_TTL_MS = 10 * 60 * 1000;
  /** Sessions are kept this long so a late payment is not lost. */
  private readonly SESSION_RETAIN_MS = 60 * 60 * 1000;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly solana: SolanaService,
  ) {}

  onModuleInit() {
    this.cleanupInterval = setInterval(
      () => this.cleanupExpiredSessions(),
      60_000,
    );
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  createPaymentRequest(
    userId: string,
    amount: number,
    tokenAddress: string,
  ): PaymentRequest {
    const cfg = this.solana.getRuntimeConfig();
    if (!cfg.mint) {
      throw new ServiceUnavailableException('arc.notConfigured');
    }
    // The client may only ask for the configured ARC mint; anything else
    // would produce a payment URL for a different token.
    if (tokenAddress !== cfg.mint) {
      throw new BadRequestException('arc.wrongToken');
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
      throw new BadRequestException('arc.invalidAmount');
    }
    const recipient = cfg.treasury;
    if (!recipient) {
      throw new ServiceUnavailableException('arc.notConfigured');
    }

    const referenceKey = Keypair.generate().publicKey.toBase58();
    const sessionId = createHash('sha256')
      .update(`${referenceKey}-${Date.now()}`)
      .digest('hex')
      .slice(0, 16);

    const params = new URLSearchParams({
      amount: amount.toString(),
      'spl-token': cfg.mint,
      reference: referenceKey,
      label: 'Arcadeum Games',
      message: `Buy ${amount} ARC`,
    });

    this.sessions.set(sessionId, {
      userId,
      amount,
      tokenAddress: cfg.mint,
      reference: referenceKey,
      createdAt: Date.now(),
    });
    this.logger.log(`Created Solana Pay session ${sessionId}: ${amount} ARC`);

    return {
      sessionId,
      solanaPayUrl: `solana:${recipient}?${params.toString()}`,
      amount,
      tokenAddress: cfg.mint,
      recipient,
      reference: referenceKey,
    };
  }

  /**
   * Status of a session owned by `userId`. `confirmed` is returned only for a
   * transaction that really moved >= the requested ARC to the treasury and
   * carries this session's reference key.
   */
  async checkPaymentStatus(
    userId: string,
    sessionId: string,
  ): Promise<PaymentStatus> {
    const session = this.sessions.get(sessionId);
    if (!session || session.userId !== userId) {
      return { status: 'expired' };
    }
    if (session.signature) {
      return { status: 'confirmed', signature: session.signature };
    }

    const late = Date.now() - session.createdAt > this.SESSION_TTL_MS;

    try {
      const found = await this.solana.findReferenceSignature(session.reference);
      if (!found) {
        return late ? { status: 'expired' } : { status: 'pending' };
      }
      if (found.failed) {
        return { status: 'failed', reason: 'tx_failed' };
      }
      const result = await this.solana.verifyTransactionDetailed(
        found.signature,
        session.amount,
        { requiredReference: session.reference },
      );
      if (result.valid) {
        session.signature = found.signature;
        session.callback?.(found.signature);
        return late
          ? { status: 'confirmed', signature: found.signature, late: true }
          : { status: 'confirmed', signature: found.signature };
      }
      // Seen on chain but not yet finalized for our commitment: keep waiting.
      if (result.reason === 'not_found' || result.reason === 'rpc_error') {
        return late ? { status: 'expired' } : { status: 'pending' };
      }
      return { status: 'failed', reason: result.reason };
    } catch (err) {
      this.logger.error(`Error checking payment: ${err}`);
      return late ? { status: 'expired' } : { status: 'pending' };
    }
  }

  /**
   * Whether `signature` was confirmed by a session of `userId`. Lets purchase
   * endpoints accept a signature without a client-supplied sender address.
   */
  ownsConfirmedSignature(userId: string, signature: string): boolean {
    for (const s of this.sessions.values()) {
      if (s.userId === userId && s.signature === signature) return true;
    }
    return false;
  }

  /** Reference key of the session of `userId` that confirmed `signature`. */
  referenceFor(userId: string, signature: string): string | null {
    for (const s of this.sessions.values()) {
      if (s.userId === userId && s.signature === signature) return s.reference;
    }
    return null;
  }

  registerCallback(
    userId: string,
    sessionId: string,
    callback: (signature: string) => void,
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.userId !== userId || session.signature) {
      return false;
    }
    session.callback = callback;
    return true;
  }

  private cleanupExpiredSessions() {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.createdAt > this.SESSION_RETAIN_MS) {
        this.sessions.delete(id);
      }
    }
  }
}
