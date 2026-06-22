import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  type VersionedTransactionResponse,
} from '@solana/web3.js';
import { createHash } from 'crypto';
import { TelegramService } from '../telegram/telegram.service';

const BUY_DISCRIMINATOR = createHash('sha256')
  .update('global:buy')
  .digest()
  .subarray(0, 8);

const SELL_DISCRIMINATOR = createHash('sha256')
  .update('global:sell')
  .digest()
  .subarray(0, 8);

const BONDING_CURVE = 'BHYF1uFfwujrZyLrAQw3vZJQFQ6XEkRk4TNxHo8kTTXj';

interface ParsedTransaction {
  type: 'buy' | 'sell';
  wallet: string;
  tokenAmount: number;
  solAmount: number;
  signature: string;
}

@Injectable()
export class PumpFunListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PumpFunListenerService.name);
  private readonly connection: Connection;
  private readonly mintAddress: PublicKey;
  private readonly pumpfunProgramId: PublicKey;
  private readonly pollIntervalMs: number;
  private readonly maxAgeSeconds: number;
  private readonly maxRpcRetries = 3;
  private seenSignatures = new Set<string>();
  private abortController = new AbortController();
  private pollPromise: Promise<void> | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly telegram: TelegramService,
  ) {
    const rpcUrl =
      this.config.get<string>('SOLANA_RPC_URL') ??
      'https://api.mainnet-beta.solana.com';
    const wsUrl =
      this.config.get<string>('SOLANA_WS_URL') ??
      rpcUrl.replace('https', 'wss');

    this.connection = new Connection(rpcUrl, {
      wsEndpoint: wsUrl,
      commitment: 'confirmed',
    });

    const mint = this.config.get<string>('PUMPFUN_MINT_ADDRESS') ?? '';
    if (!mint) {
      throw new Error('PUMPFUN_MINT_ADDRESS is required');
    }
    this.mintAddress = new PublicKey(mint);

    const programId =
      this.config.get<string>('PUMPFUN_PROGRAM_ID') ??
      '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
    this.pumpfunProgramId = new PublicKey(programId);

    this.pollIntervalMs = this.config.get<number>('POLL_INTERVAL_MS') ?? 10_000;
    this.maxAgeSeconds = this.config.get<number>('MAX_TX_AGE_SECONDS') ?? 300;
  }

  onModuleInit() {
    this.pollPromise = this.startPolling();
  }

  async onModuleDestroy() {
    this.abortController.abort();
    if (this.pollPromise) {
      await this.pollPromise;
    }
    this.logger.log('Polling stopped');
  }

  private async startPolling() {
    const mint = this.mintAddress.toBase58();
    this.logger.log(`Polling transactions for mint: ${mint}`);
    this.logger.log(`Poll interval: ${this.pollIntervalMs}ms`);

    while (!this.abortController.signal.aborted) {
      try {
        await this.pollTransactions();
      } catch (err) {
        this.logger.error(`Poll error: ${err}`);
      }

      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, this.pollIntervalMs);
        this.abortController.signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            resolve();
          },
          { once: true },
        );
      });
    }
  }

  private async pollTransactions() {
    const signatures = await this.retryRpc(() =>
      this.connection.getSignaturesForAddress(this.mintAddress, { limit: 20 }),
    );

    if (!signatures) return;

    const cutoff = Math.floor(Date.now() / 1000) - this.maxAgeSeconds;

    const newSigs = signatures.filter(
      (s) =>
        !this.seenSignatures.has(s.signature) &&
        !s.err &&
        (s.blockTime ?? 0) >= cutoff,
    );

    const skipped = signatures.length - newSigs.length;
    if (skipped > 0 && newSigs.length > 0) {
      this.logger.debug(`Skipped ${skipped} old/seen transaction(s)`);
    }

    for (const sig of newSigs) {
      try {
        const tx = await this.retryRpc(() =>
          this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed',
          }),
        );

        if (!tx) {
          this.seenSignatures.add(sig.signature);
          continue;
        }

        const parsed = this.parseTransaction(tx, sig.signature);
        this.seenSignatures.add(sig.signature);

        if (!parsed) continue;

        await this.telegram.sendTransaction(parsed);
      } catch (err) {
        this.logger.error(`Failed to process ${sig.signature}: ${err}`);
        this.seenSignatures.add(sig.signature);
      }
    }

    if (this.seenSignatures.size > 500) {
      const arr = Array.from(this.seenSignatures);
      this.seenSignatures = new Set(arr.slice(-200));
    }
  }

  private async retryRpc<T>(fn: () => Promise<T>): Promise<T | null> {
    for (let attempt = 1; attempt <= this.maxRpcRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        const isLast = attempt === this.maxRpcRetries;
        if (isLast) {
          this.logger.error(
            `RPC call failed after ${this.maxRpcRetries} attempts: ${err}`,
          );
          return null;
        }
        const delay = Math.min(1000 * 2 ** (attempt - 1), 10_000);
        this.logger.warn(
          `RPC attempt ${attempt} failed, retrying in ${delay}ms`,
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    return null;
  }

  private getAccountKeys(tx: VersionedTransactionResponse): string[] {
    const msg = tx.transaction.message;
    const accountKeys = msg.staticAccountKeys ?? [];
    return accountKeys.map((k) => k.toBase58());
  }

  private parseTransaction(
    tx: VersionedTransactionResponse,
    signature: string,
  ): ParsedTransaction | null {
    if (!tx.meta) return null;

    const mintBase58 = this.mintAddress.toBase58();

    const preTokenBalances = tx.meta.preTokenBalances ?? [];
    const postTokenBalances = tx.meta.postTokenBalances ?? [];

    let type: 'buy' | 'sell' | null = null;
    let typeSource = 'none';

    if (tx.meta.innerInstructions) {
      for (const inner of tx.meta.innerInstructions) {
        for (const ix of inner.instructions) {
          if ('data' in ix && ix.data) {
            const data = Buffer.from(ix.data, 'base64');
            if (data.length >= 8) {
              const disc = data.subarray(0, 8);
              if (disc.equals(BUY_DISCRIMINATOR)) {
                type = 'buy';
                typeSource = 'discriminator';
                break;
              }
              if (disc.equals(SELL_DISCRIMINATOR)) {
                type = 'sell';
                typeSource = 'discriminator';
                break;
              }
            }
          }
        }
        if (type) break;
      }
    }

    if (!type) {
      const accounts = this.getAccountKeys(tx);

      // Collect all token balance changes for our mint
      interface TokenDelta {
        owner: string;
        walletIdx: number;
        delta: number;
        preAmount: number;
        postAmount: number;
      }
      const deltas: TokenDelta[] = [];

      for (const post of postTokenBalances) {
        if (post.mint !== mintBase58 || !post.owner) continue;

        const pre = preTokenBalances.find(
          (p) => p.accountIndex === post.accountIndex && p.mint === mintBase58,
        );

        const postAmount = Number(post.uiTokenAmount.amount);
        const preAmount = pre ? Number(pre.uiTokenAmount.amount) : 0;
        const delta = postAmount - preAmount;

        if (delta === 0) continue;

        const walletIdx = accounts.indexOf(post.owner);

        deltas.push({ owner: post.owner, walletIdx, delta, preAmount, postAmount });
      }

      if (deltas.length > 0) {
        // Phase 1: try strict check (token + SOL at same wallet)
        for (const d of deltas) {
          if (d.walletIdx === -1) continue;

          const solPre = tx.meta.preBalances[d.walletIdx] ?? 0;
          const solPost = tx.meta.postBalances[d.walletIdx] ?? 0;

          if (d.delta > 0 && solPre > solPost) {
            type = 'buy';
            typeSource = 'token-balance';
            break;
          }
          if (d.delta < 0 && solPost > solPre) {
            type = 'sell';
            typeSource = 'token-balance';
            break;
          }
        }

        // Phase 2: use token direction without SOL confirmation
        if (!type) {
          // Exclude bonding curve — it's always the counterparty, not the user
          const userDeltas = deltas.filter(
            (d) => d.owner !== BONDING_CURVE,
          );

          if (userDeltas.length >= 1) {
            const d = userDeltas[0];
            type = d.delta > 0 ? 'buy' : 'sell';
            typeSource = 'token-balance';
          } else if (deltas.length === 1) {
            const d = deltas[0];
            type = d.delta < 0 ? 'buy' : 'sell';
            typeSource = 'token-balance';
          }
        }
      }

      if (!type) return null;
    }

    const wallet =
      this.findWalletFromTokenBalance(tx, mintBase58, 'increase') ??
      this.findWalletFromTokenBalance(tx, mintBase58, 'decrease');

    if (!wallet) {
      // Fallback: find wallet from SOL balance changes (exclude bonding curve)
      // Pick the account with the LARGEST SOL change (most likely the actual trade)
      const accounts = this.getAccountKeys(tx);
      const expectedSolDirection = type === 'buy' ? 'decrease' : 'increase';
      let bestWallet: string | null = null;
      let bestSolChange = 0;

      for (let i = 0; i < accounts.length; i++) {
        if (accounts[i] === BONDING_CURVE) continue;
        const solPre = tx.meta.preBalances[i] ?? 0;
        const solPost = tx.meta.postBalances[i] ?? 0;

        if (expectedSolDirection === 'decrease' && solPre > solPost) {
          const change = solPre - solPost;
          if (change > bestSolChange) {
            bestSolChange = change;
            bestWallet = accounts[i];
          }
        }
        if (expectedSolDirection === 'increase' && solPost > solPre) {
          const change = solPost - solPre;
          if (change > bestSolChange) {
            bestSolChange = change;
            bestWallet = accounts[i];
          }
        }
      }

      if (bestWallet) {
        return {
          type,
          wallet: bestWallet,
          tokenAmount: Math.abs(this.extractTokenAmount(tx, bestWallet, mintBase58)),
          solAmount: bestSolChange / LAMPORTS_PER_SOL,
          signature,
        };
      }

      return null;
    }

    let solAmount = this.extractSolAmount(tx, wallet);
    let tokenAmount = this.extractTokenAmount(tx, wallet, mintBase58);

    if (solAmount === 0 && tokenAmount === 0) return null;

    // For phase2-detected txns, SOL may go through wSOL — extract from bonding curve
    if (Math.abs(solAmount) < 0.001 && tokenAmount !== 0) {
      const curveSol = this.extractSolAmount(tx, BONDING_CURVE);
      if (Math.abs(curveSol) > 0.001) {
        solAmount = type === 'buy' ? -curveSol : curveSol;
      }
    }

    this.logger.log(
      `[${signature.slice(0, 8)}] ${type.toUpperCase()} via ${typeSource} | wallet: ${wallet.slice(0, 8)}... | tokens: ${tokenAmount.toFixed(2)} | sol: ${solAmount.toFixed(4)}`,
    );

    return {
      type,
      wallet,
      tokenAmount: Math.abs(tokenAmount),
      solAmount: Math.abs(solAmount),
      signature,
    };
  }

  private findWalletFromTokenBalance(
    tx: VersionedTransactionResponse,
    mintBase58: string,
    direction: 'increase' | 'decrease',
  ): string | null {
    if (!tx.meta) return null;

    const preTokenBalances = tx.meta.preTokenBalances ?? [];
    const postTokenBalances = tx.meta.postTokenBalances ?? [];

    for (let i = 0; i < postTokenBalances.length; i++) {
      const post = postTokenBalances[i];
      if (post.mint !== mintBase58 || !post.owner) continue;
      if (post.owner === BONDING_CURVE) continue;

      const pre = preTokenBalances.find(
        (p) => p.accountIndex === post.accountIndex && p.mint === mintBase58,
      );

      const postAmount = Number(post.uiTokenAmount.amount);
      const preAmount = pre ? Number(pre.uiTokenAmount.amount) : 0;

      if (direction === 'increase' && postAmount > preAmount) {
        return post.owner ?? null;
      }
      if (direction === 'decrease' && preAmount > postAmount) {
        return pre?.owner ?? post.owner ?? null;
      }
    }

    return null;
  }

  private extractSolAmount(
    tx: VersionedTransactionResponse,
    wallet: string,
  ): number {
    if (!tx.meta) return 0;

    const accounts = this.getAccountKeys(tx);
    const walletIdx = accounts.indexOf(wallet);

    if (walletIdx === -1) return 0;

    const pre = tx.meta.preBalances[walletIdx] ?? 0;
    const post = tx.meta.postBalances[walletIdx] ?? 0;

    return (pre - post) / LAMPORTS_PER_SOL;
  }

  private extractTokenAmount(
    tx: VersionedTransactionResponse,
    wallet: string,
    mintBase58: string,
  ): number {
    if (!tx.meta) return 0;

    const preTokenBalances = tx.meta.preTokenBalances ?? [];
    const postTokenBalances = tx.meta.postTokenBalances ?? [];

    const pre = preTokenBalances.find(
      (b) => b.owner === wallet && b.mint === mintBase58,
    );
    const post = postTokenBalances.find(
      (b) => b.owner === wallet && b.mint === mintBase58,
    );

    const preAmount = pre ? Number(pre.uiTokenAmount.amount) : 0;
    const postAmount = post ? Number(post.uiTokenAmount.amount) : 0;

    const decimals = post?.uiTokenAmount.decimals ?? 6;
    return (postAmount - preAmount) / 10 ** decimals;
  }
}
