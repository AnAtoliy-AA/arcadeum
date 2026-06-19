import { Injectable, Logger } from '@nestjs/common';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  getAccount,
} from '@solana/spl-token';
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
  private arcadeumPriceCache: { price: number; expiresAt: number } | null = null;
  private static readonly CACHE_TTL_MS = 60_000;

  constructor(private readonly config: ConfigService) {
    const rpcUrl =
      this.config.get<string>('SOLANA_RPC_URL') ??
      'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');

    const mintAddress = this.config.getOrThrow<string>('ARCADEUM_MINT_ADDRESS');
    this.arcadeumMint = getArcadeumMint(mintAddress);
  }

  private getKeypair() {
    const secretKeyJson = this.config.getOrThrow<string>('SOLANA_PRIVATE_KEY');
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

  async transferArcadeum(
    recipientAddress: string,
    amount: number,
  ): Promise<string> {
    const keypair = this.getKeypair();
    const recipient = new PublicKey(recipientAddress);
    const rawAmount = toRawAmount(amount);

    const fromAta = await getAssociatedTokenAddress(
      this.arcadeumMint,
      keypair.publicKey,
    );
    const toAta = await getAssociatedTokenAddress(
      this.arcadeumMint,
      recipient,
    );

    const transaction = new Transaction().add(
      createTransferInstruction(fromAta, toAta, keypair.publicKey, rawAmount),
    );

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = keypair.publicKey;
    transaction.sign(keypair);

    const signature = await this.connection.sendRawTransaction(
      transaction.serialize(),
    );

    await this.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    this.logger.log(
      `Transferred ${amount} ARCADEUM to ${recipientAddress}: ${signature}`,
    );
    return signature;
  }

  async transferSol(
    recipientAddress: string,
    lamports: number,
  ): Promise<string> {
    const keypair = this.getKeypair();
    const recipient = new PublicKey(recipientAddress);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: recipient,
        lamports,
      }),
    );

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = keypair.publicKey;
    transaction.sign(keypair);

    const signature = await this.connection.sendRawTransaction(
      transaction.serialize(),
    );

    await this.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    this.logger.log(
      `Transferred ${lamports} lamports to ${recipientAddress}: ${signature}`,
    );
    return signature;
  }
}
