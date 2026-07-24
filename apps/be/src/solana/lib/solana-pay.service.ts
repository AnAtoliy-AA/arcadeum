import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { createHash } from 'crypto';
import { SolanaService } from '../solana.service';
import { EconomySettingsService } from '../../economy/economy-settings.service';

export interface PaymentRequest {
  sessionId: string;
  solanaPayUrl: string;
  amount: number;
  tokenAddress: string;
  recipient: string;
  reference: string;
}

export interface PaymentStatus {
  status: 'pending' | 'confirmed' | 'expired';
  signature?: string;
}

interface Session {
  amount: number;
  tokenAddress: string;
  reference: string;
  createdAt: number;
  signature?: string;
  callback?: (signature: string) => void;
}

@Injectable()
export class SolanaPayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SolanaPayService.name);
  private readonly sessions = new Map<string, Session>();
  private readonly SESSION_TTL_MS = 10 * 60 * 1000;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly solana: SolanaService,
    private readonly economy: EconomySettingsService,
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
    amount: number,
    tokenAddress: string,
    callback?: (signature: string) => void,
  ): PaymentRequest {
    const recipient = this.config.get<string>('SOLANA_TREASURY_ADDRESS') ?? '';
    if (!recipient) {
      throw new Error('SOLANA_TREASURY_ADDRESS not configured');
    }

    const referenceKeypair = Keypair.generate();
    const referenceKey = referenceKeypair.publicKey.toBase58();

    const sessionId = createHash('sha256')
      .update(`${referenceKey}-${Date.now()}`)
      .digest('hex')
      .slice(0, 16);

    const label = 'Arcadeum Games';
    const message = `Buy ${amount} ARC`;

    const params = new URLSearchParams({
      amount: amount.toString(),
      'spl-token': tokenAddress,
      reference: referenceKey,
      label,
      message,
    });

    const solanaPayUrl = `solana:${recipient}?${params.toString()}`;

    this.sessions.set(sessionId, {
      amount,
      tokenAddress,
      reference: referenceKey,
      createdAt: Date.now(),
      callback,
    });

    this.logger.log(`Created Solana Pay session ${sessionId}: ${amount} ARC`);

    return {
      sessionId,
      solanaPayUrl,
      amount,
      tokenAddress,
      recipient,
      reference: referenceKey,
    };
  }

  async checkPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { status: 'expired' };
    }

    if (Date.now() - session.createdAt > this.SESSION_TTL_MS) {
      this.sessions.delete(sessionId);
      return { status: 'expired' };
    }

    if (session.signature) {
      return { status: 'confirmed', signature: session.signature };
    }

    try {
      const connection = this.getConnection();
      const referenceKey = new PublicKey(session.reference);
      const signatures = await connection.getSignaturesForAddress(
        referenceKey,
        { limit: 1 },
      );
      if (signatures.length > 0 && !signatures[0].err) {
        const sig = signatures[0].signature;
        session.signature = sig;
        this.sessions.delete(sessionId);
        session.callback?.(sig);
        return { status: 'confirmed', signature: sig };
      }
    } catch (err) {
      this.logger.error(`Error checking payment: ${err}`);
    }

    return { status: 'pending' };
  }

  registerCallback(
    sessionId: string,
    callback: (signature: string) => void,
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.signature) return false;
    session.callback = callback;
    return true;
  }

  private cleanupExpiredSessions() {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.createdAt > this.SESSION_TTL_MS) {
        this.sessions.delete(id);
      }
    }
  }

  private getConnection(): Connection {
    const rpcUrl =
      this.config.get<string>('SOLANA_RPC_URL') ??
      'https://api.mainnet-beta.solana.com';
    return new Connection(rpcUrl, 'confirmed');
  }
}
