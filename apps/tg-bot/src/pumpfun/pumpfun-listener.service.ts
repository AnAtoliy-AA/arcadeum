import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
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

interface ParsedTransaction {
  type: 'buy' | 'sell';
  wallet: string;
  tokenAmount: number;
  solAmount: number;
  signature: string;
}

@Injectable()
export class PumpFunListenerService implements OnModuleInit {
  private readonly logger = new Logger(PumpFunListenerService.name);
  private readonly connection: Connection;
  private readonly mintAddress: PublicKey;
  private readonly pumpfunProgramId: PublicKey;
  private seenSignatures = new Set<string>();
  private static readonly POLL_INTERVAL_MS = 10_000;

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
  }

  async onModuleInit() {
    await this.startPolling();
  }

  private async startPolling() {
    const mint = this.mintAddress.toBase58();
    this.logger.log(`Polling transactions for mint: ${mint}`);
    this.logger.log(
      `Poll interval: ${PumpFunListenerService.POLL_INTERVAL_MS}ms`,
    );

    while (true) {
      try {
        await this.pollTransactions();
      } catch (err) {
        this.logger.error(`Poll error: ${err}`);
      }
      await new Promise((r) =>
        setTimeout(r, PumpFunListenerService.POLL_INTERVAL_MS),
      );
    }
  }

  private async pollTransactions() {
    const signatures = await this.connection.getSignaturesForAddress(
      this.mintAddress,
      { limit: 20 },
    );

    const newSigs = signatures.filter(
      (s) => !this.seenSignatures.has(s.signature) && !s.err,
    );

    for (const sig of newSigs) {
      this.seenSignatures.add(sig.signature);
    }

    if (newSigs.length > 0) {
      this.logger.log(`Found ${newSigs.length} new transaction(s)`);
    }

    for (const sig of newSigs) {
      try {
        const tx = await this.connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed',
        });

        if (!tx) continue;

        const parsed = this.parseTransaction(tx, sig.signature);
        if (!parsed) continue;

        await this.telegram.sendTransaction(parsed);
      } catch (err) {
        this.logger.error(`Failed to process ${sig.signature}: ${err}`);
      }
    }

    if (this.seenSignatures.size > 500) {
      const arr = Array.from(this.seenSignatures);
      this.seenSignatures = new Set(arr.slice(-200));
    }
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

    const accounts = this.getAccountKeys(tx);
    const mintBase58 = this.mintAddress.toBase58();

    const preTokenBalances = tx.meta.preTokenBalances ?? [];
    const postTokenBalances = tx.meta.postTokenBalances ?? [];

    let type: 'buy' | 'sell' | null = null;

    if (tx.meta.innerInstructions) {
      for (const inner of tx.meta.innerInstructions) {
        for (const ix of inner.instructions) {
          if ('data' in ix && ix.data) {
            const data = Buffer.from(ix.data, 'base64');
            if (data.length >= 8) {
              const disc = data.subarray(0, 8);
              if (disc.equals(BUY_DISCRIMINATOR)) {
                type = 'buy';
                break;
              }
              if (disc.equals(SELL_DISCRIMINATOR)) {
                type = 'sell';
                break;
              }
            }
          }
        }
        if (type) break;
      }
    }

    if (!type) {
      const hasMintInTokens =
        preTokenBalances.some((b) => b.mint === mintBase58) ||
        postTokenBalances.some((b) => b.mint === mintBase58);

      if (!hasMintInTokens) return null;

      const prePostDiff = tx.meta.preBalances.map(
        (pre, i) => pre - (tx.meta?.postBalances[i] ?? 0),
      );

      const hasSolOutflow = prePostDiff.some((d) => d > 0);
      const hasSolInflow = prePostDiff.some((d) => d < 0);

      if (hasSolOutflow && hasSolInflow) {
        type = 'buy';
      } else if (hasSolOutflow) {
        type = 'sell';
      } else {
        return null;
      }
    }

    const wallet =
      type === 'buy'
        ? this.findWalletFromTokenBalance(tx, mintBase58, 'increase')
        : this.findWalletFromTokenBalance(tx, mintBase58, 'decrease');

    if (!wallet) return null;

    const solAmount = this.extractSolAmount(tx, wallet);
    const tokenAmount = this.extractTokenAmount(tx, wallet, mintBase58);

    if (solAmount === 0 && tokenAmount === 0) return null;

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
