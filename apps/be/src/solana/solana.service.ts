import { Injectable, Logger } from '@nestjs/common';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { ConfigService } from '@nestjs/config';
import { getPlatformKeypair } from './lib/solana-keypair';
import {
  getArcadeumMint,
  toRawAmount,
  fromRawAmount,
} from './lib/arcadeum-token';

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  private readonly connection: Connection;
  private readonly arcadeumMint: PublicKey;

  private solPriceCache: { price: number; expiresAt: number } | null = null;
  private arcadeumPriceCache: { price: number; expiresAt: number } | null =
    null;
  private static readonly CACHE_TTL_MS = 60_000;

  constructor(private readonly config: ConfigService) {
    const rpcUrl =
      this.config.get<string>('SOLANA_RPC_URL') ??
      'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');

    const mintAddress = this.config.get<string>('ARCADEUM_MINT_ADDRESS') ?? '';
    const isValidMint =
      mintAddress && /^[1-9A-HJ-NP-Za-km-z]+$/.test(mintAddress);
    if (!isValidMint && mintAddress) {
      this.logger.warn(
        `ARCADEUM_MINT_ADDRESS "${mintAddress}" is not valid base58 — using System Program fallback`,
      );
    }
    this.arcadeumMint = isValidMint
      ? getArcadeumMint(mintAddress)
      : new PublicKey('11111111111111111111111111111111');
  }

  private getKeypair() {
    const secretKeyJson = this.config.get<string>('SOLANA_PRIVATE_KEY') ?? '';
    return getPlatformKeypair(secretKeyJson);
  }

  async getSolPrice(): Promise<number> {
    const now = Date.now();
    if (this.solPriceCache && now < this.solPriceCache.expiresAt) {
      return this.solPriceCache.price;
    }

    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch SOL price: ${res.status}`);
    }
    const data = (await res.json()) as { solana?: { usd?: number } };
    const price = data?.solana?.usd;
    if (typeof price !== 'number') {
      throw new Error('Invalid SOL price response');
    }

    this.solPriceCache = { price, expiresAt: now + SolanaService.CACHE_TTL_MS };
    return price;
  }

  async getArcadeumPrice(): Promise<number> {
    const now = Date.now();
    if (this.arcadeumPriceCache && now < this.arcadeumPriceCache.expiresAt) {
      return this.arcadeumPriceCache.price;
    }

    const mintAddress = this.arcadeumMint.toBase58();
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${mintAddress}&vs_currencies=usd`,
    );
    if (!res.ok) {
      this.logger.warn(`Failed to fetch ARCADEUM price: ${res.status}`);
      return 0;
    }
    const data = (await res.json()) as Record<string, { usd?: number }>;
    const price = data?.[mintAddress]?.usd ?? 0;

    this.arcadeumPriceCache = {
      price,
      expiresAt: now + SolanaService.CACHE_TTL_MS,
    };
    return price;
  }

  async getTokenMetadata(): Promise<{
    name: string;
    symbol: string;
    description: string;
    image: string | null;
    pumpfunUrl: string | null;
    marketCapUsd: number | null;
    totalSupply: string | null;
    createdAt: number | null;
    twitter: string | null;
    website: string | null;
  } | null> {
    const mintAddress = this.arcadeumMint.toBase58();

    try {
      const res = await fetch(
        `https://frontend-api-v3.pump.fun/coins/${mintAddress}`,
      );
      if (!res.ok) {
        this.logger.warn(`pump.fun API returned ${res.status}`);
        return null;
      }

      const data = (await res.json()) as {
        name?: string;
        symbol?: string;
        description?: string;
        image_uri?: string;
        usd_market_cap?: number;
        total_supply_str?: string;
        created_timestamp?: number;
        twitter?: string;
        website?: string;
      };

      return {
        name: data.name ?? '',
        symbol: data.symbol ?? '',
        description: data.description ?? '',
        image: data.image_uri ?? null,
        pumpfunUrl: `https://pump.fun/coin/${mintAddress}`,
        marketCapUsd: data.usd_market_cap ?? null,
        totalSupply: data.total_supply_str ?? null,
        createdAt: data.created_timestamp ?? null,
        twitter: data.twitter ?? null,
        website: data.website ?? null,
      };
    } catch {
      this.logger.warn('Failed to fetch token metadata from pump.fun');
      return null;
    }
  }

  async getPlatformBalance(): Promise<{ sol: number; arcadeum: number }> {
    const keypair = this.getKeypair();
    const solBalance = await this.connection.getBalance(keypair.publicKey);

    let arcadeumBalance = 0;
    try {
      const ata = await getAssociatedTokenAddress(
        this.arcadeumMint,
        keypair.publicKey,
      );
      const account = await getAccount(this.connection, ata);
      arcadeumBalance = fromRawAmount(account.amount);
    } catch {
      this.logger.warn('Platform wallet has no ARCADEUM token account');
    }

    return {
      sol: solBalance / LAMPORTS_PER_SOL,
      arcadeum: arcadeumBalance,
    };
  }

  async verifyTransaction(
    signature: string,
    expectedAmount: number,
    senderAddress: string,
  ): Promise<boolean> {
    try {
      const keypair = this.getKeypair();
      const treasuryAddress = keypair.publicKey.toBase58();

      const transaction = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (!transaction) {
        this.logger.warn(`Transaction ${signature} not found`);
        return false;
      }

      if (transaction.meta?.err) {
        this.logger.warn(`Transaction ${signature} failed`);
        return false;
      }

      const sender = new PublicKey(senderAddress);
      const treasury = new PublicKey(treasuryAddress);

      const message = transaction.transaction.message;
      const accountKeys = message.staticAccountKeys ?? [];
      const senderIndex = accountKeys.findIndex((key) => key.equals(sender));
      const treasuryIndex = accountKeys.findIndex((key) =>
        key.equals(treasury),
      );

      if (senderIndex === -1 || treasuryIndex === -1) {
        this.logger.warn('Sender or treasury not found in transaction');
        return false;
      }

      const innerInstructions =
        transaction.meta?.innerInstructions?.flat() ?? [];
      const tokenProgramId = new PublicKey(
        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      );
      for (const ix of innerInstructions) {
        const compiledIx = ix as unknown as {
          programIdIndex: number;
          accounts: number[];
          data?: string;
        };
        const programId = accountKeys[compiledIx.programIdIndex];
        if (programId?.equals(tokenProgramId)) {
          const accounts = compiledIx.accounts;
          if (accounts.length >= 4) {
            const source = accountKeys[accounts[0]];
            const destination = accountKeys[accounts[1]];

            if (source?.equals(sender) && destination?.equals(treasury)) {
              const data = compiledIx.data;
              if (data) {
                const buffer = Buffer.from(data, 'base64');
                if (buffer.length >= 8) {
                  const amount = Number(buffer.readBigUInt64LE(0));
                  if (amount >= toRawAmount(expectedAmount)) {
                    return true;
                  }
                }
              }
            }
          }
        }
      }

      this.logger.warn('No matching ARC transfer found in transaction');
      return false;
    } catch (err) {
      this.logger.error(
        `Failed to verify transaction: ${err instanceof Error ? err.message : err}`,
      );
      return false;
    }
  }
}
