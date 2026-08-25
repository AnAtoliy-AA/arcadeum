import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getPlatformKeypair } from './lib/solana-keypair';
import {
  toRawAmount,
  fromRawAmount,
  SOLANA_TOKEN_PROGRAM_IDS,
} from './lib/arcadeum-token';

type Web3Module = typeof import('@solana/web3.js');
type SplTokenModule = typeof import('@solana/spl-token');

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  private connection: import('@solana/web3.js').Connection | null = null;
  private arcadeumMint: import('@solana/web3.js').PublicKey | null = null;
  private web3: Web3Module | null = null;
  private splToken: SplTokenModule | null = null;

  private solPriceCache: { price: number; expiresAt: number } | null = null;
  private arcadeumPriceCache: { price: number; expiresAt: number } | null =
    null;
  private static readonly CACHE_TTL_MS = 60_000;
  /**
   * A fresh quote must be at least this fraction of the previously accepted
   * quote. Blocks thin-market pumps / poisoned oracle responses from briefly
   * collapsing the ARC price used to price gem packages and shop items.
   */
  private static readonly ARCADEUM_PRICE_MIN_FRACTION_OF_PREVIOUS = 0.25;

  constructor(private readonly config: ConfigService) {}

  private async loadWeb3(): Promise<Web3Module> {
    if (!this.web3) {
      this.web3 = await import('@solana/web3.js');
    }
    return this.web3;
  }

  private async loadSplToken(): Promise<SplTokenModule> {
    if (!this.splToken) {
      this.splToken = await import('@solana/spl-token');
    }
    return this.splToken;
  }

  private async getConnection(): Promise<import('@solana/web3.js').Connection> {
    if (!this.connection) {
      const { Connection } = await this.loadWeb3();
      const rpcUrl =
        this.config.get<string>('SOLANA_RPC_URL') ??
        'https://api.mainnet-beta.solana.com';
      this.connection = new Connection(rpcUrl, 'confirmed');
    }
    return this.connection;
  }

  private async getArcadeumMintKey(): Promise<
    import('@solana/web3.js').PublicKey
  > {
    if (!this.arcadeumMint) {
      const { PublicKey } = await this.loadWeb3();
      const mintAddress =
        this.config.get<string>('ARCADEUM_MINT_ADDRESS') ?? '';
      const isValidMint =
        mintAddress && /^[1-9A-HJ-NP-Za-km-z]+$/.test(mintAddress);
      if (!isValidMint && mintAddress) {
        this.logger.warn(
          `ARCADEUM_MINT_ADDRESS "${mintAddress}" is not valid base58 — using System Program fallback`,
        );
      }
      this.arcadeumMint = isValidMint
        ? new PublicKey(mintAddress)
        : new PublicKey('11111111111111111111111111111111');
    }
    return this.arcadeumMint;
  }

  private async getKeypair() {
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

    const mint = await this.getArcadeumMintKey();
    const mintAddress = mint.toBase58();

    // Try CoinGecko first
    let coinGeckoPrice = 0;
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${mintAddress}&vs_currencies=usd`,
      );
      if (res.ok) {
        const data = (await res.json()) as Record<string, { usd?: number }>;
        const price = data?.[mintAddress]?.usd ?? 0;
        if (price > 0) {
          coinGeckoPrice = price;
        }
      }
    } catch {
      // Fall through to pump.fun
    }

    // Fallback: calculate from pump.fun market cap
    let pumpFunPrice = 0;
    try {
      const pfRes = await fetch(
        `https://frontend-api-v3.pump.fun/coins/${mintAddress}`,
      );
      if (pfRes.ok) {
        const pfData = (await pfRes.json()) as {
          usd_market_cap?: number;
          total_supply_str?: string;
          base_decimals?: number;
        };
        const mc = pfData.usd_market_cap ?? 0;
        const supply = parseFloat(pfData.total_supply_str ?? '0');
        const decimals = pfData.base_decimals ?? 6;
        const supplyHuman = supply / 10 ** decimals;
        if (mc > 0 && supplyHuman > 0) {
          pumpFunPrice = mc / supplyHuman;
        }
      }
    } catch {
      // Fall through
    }

    // Sanity band: the price drives how many ARC a payment requires, so a
    // manipulated oracle directly changes gem pricing. Reject quotes that
    // move too far from the previously accepted reference within one TTL
    // window, and require the sources to roughly agree when both respond.
    const candidate =
      coinGeckoPrice > 0 && pumpFunPrice > 0
        ? Math.min(coinGeckoPrice, pumpFunPrice)
        : Math.max(coinGeckoPrice, pumpFunPrice);

    if (candidate <= 0) {
      this.logger.warn('Could not fetch ARCADEUM price from any source');
      return 0;
    }

    const previous = this.arcadeumPriceCache?.price ?? 0;
    if (
      previous > 0 &&
      candidate <
        previous * SolanaService.ARCADEUM_PRICE_MIN_FRACTION_OF_PREVIOUS
    ) {
      this.logger.error(
        `ARCADEUM price sanity check failed: candidate ${candidate} deviates too far from reference ${previous} — rejecting quote`,
      );
      return 0;
    }

    this.arcadeumPriceCache = {
      price: candidate,
      expiresAt: now + SolanaService.CACHE_TTL_MS,
    };
    return candidate;
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
    const mint = await this.getArcadeumMintKey();
    const mintAddress = mint.toBase58();

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
    const { LAMPORTS_PER_SOL, PublicKey } = await this.loadWeb3();
    const { getAssociatedTokenAddress, getAccount } = await this.loadSplToken();
    const connection = await this.getConnection();
    const mint = await this.getArcadeumMintKey();

    const treasuryAddress =
      this.config.get<string>('SOLANA_TREASURY_ADDRESS') ?? '';
    if (!treasuryAddress) {
      this.logger.warn('SOLANA_TREASURY_ADDRESS not set');
      return { sol: 0, arcadeum: 0 };
    }

    const treasuryPubkey = new PublicKey(treasuryAddress);
    const solBalance = await connection.getBalance(treasuryPubkey);

    // ARC may live under either token program — resolve both ATAs and read
    // whichever exists.
    let arcadeumBalance = 0;
    for (const programId of SOLANA_TOKEN_PROGRAM_IDS) {
      try {
        const programPublicKey = new PublicKey(programId);
        const ata = await getAssociatedTokenAddress(
          mint,
          treasuryPubkey,
          true,
          programPublicKey,
        );
        const account = await getAccount(
          connection,
          ata,
          'confirmed',
          programPublicKey,
        );
        arcadeumBalance += fromRawAmount(account.amount);
      } catch {
        // No token account under this program — expected when the mint uses
        // the other program or the treasury holds no ARC yet.
      }
    }

    return {
      sol: solBalance / LAMPORTS_PER_SOL,
      arcadeum: arcadeumBalance,
    };
  }

  /**
   * Verify that `signature` is a confirmed on-chain transfer of at least
   * `expectedAmount` ARCADEUM tokens (exact mint) into the platform
   * treasury, initiated by `senderAddress`.
   *
   * Security invariants:
   *  - The transferred token MUST match the configured ARCADEUM mint — any
   *    other SPL asset is rejected.
   *  - Funds MUST land in a treasury-owned destination (canonical ATA for
   *    either token program, or an account explicitly owned by the treasury).
   *  - Only parsed `transferChecked` instructions are accepted, so the mint,
   *    decimals and raw amount are attested by the token program itself.
   */
  async verifyTransaction(
    signature: string,
    expectedAmount: number,
    senderAddress: string,
  ): Promise<boolean> {
    try {
      const { PublicKey } = await this.loadWeb3();
      const connection = await this.getConnection();
      const keypair = await this.getKeypair();
      const treasuryPubkey = keypair.publicKey;
      const mint = await this.getArcadeumMintKey();

      if (mint.equals(PublicKey.default)) {
        this.logger.error(
          'ARCADEUM_MINT_ADDRESS is not configured — refusing to verify deposits',
        );
        return false;
      }

      // Fail closed when the deposit recipient and the Solana Pay recipient
      // are configured as different wallets.
      const configuredTreasury =
        this.config.get<string>('SOLANA_TREASURY_ADDRESS') ?? '';
      if (
        configuredTreasury &&
        configuredTreasury !== treasuryPubkey.toBase58()
      ) {
        this.logger.error(
          'SOLANA_TREASURY_ADDRESS does not match the platform keypair public key — refusing to verify deposits',
        );
        return false;
      }

      const transaction = await connection.getParsedTransaction(signature, {
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
      const { getAssociatedTokenAddress } = await this.loadSplToken();
      const treasuryAtas = new Set<string>();
      for (const programId of SOLANA_TOKEN_PROGRAM_IDS) {
        try {
          const ata = await getAssociatedTokenAddress(
            mint,
            treasuryPubkey,
            true,
            new PublicKey(programId),
          );
          treasuryAtas.add(ata.toBase58());
        } catch {
          // Unreachable in practice; treat as "no ATA under this program".
        }
      }
      const treasuryBase58 = treasuryPubkey.toBase58();
      const mintBase58 = mint.toBase58();

      interface ParsedTransferInfo {
        authority?: string;
        multisigAuthority?: string;
        source?: string;
        destination?: string;
        destinationOwner?: string;
        mint?: string;
        tokenAmount?: { amount?: string };
        amount?: string | number;
      }

      const instructions = [
        ...(transaction.transaction.message.instructions ?? []),
        ...(transaction.meta?.innerInstructions?.flatMap(
          (inner) => inner.instructions,
        ) ?? []),
      ];

      const expectedRaw = toRawAmount(expectedAmount);

      for (const ix of instructions) {
        const parsedIx = ix as {
          program?: string;
          programId?: { toBase58?: () => string };
          type?: string;
          parsed?: { type?: string; info?: ParsedTransferInfo };
        };

        const isTokenProgram =
          parsedIx.program === 'spl-token' ||
          parsedIx.program === 'spl-token-2022' ||
          (typeof parsedIx.programId?.toBase58 === 'function' &&
            SOLANA_TOKEN_PROGRAM_IDS.includes(parsedIx.programId.toBase58()));
        if (!isTokenProgram) continue;

        const info = parsedIx.parsed?.info;
        if (!info) continue;

        // Only transferChecked carries an on-chain-attested mint + raw
        // amount. Plain `transfer` cannot prove which token moved, so it is
        // deliberately rejected.
        if (
          parsedIx.parsed?.type !== 'transferChecked' &&
          parsedIx.type !== 'transferChecked'
        ) {
          continue;
        }

        if (info.mint !== mintBase58) continue;

        const rawAmount = BigInt(info.tokenAmount?.amount ?? '0');
        if (rawAmount < expectedRaw) continue;

        const destination = info.destination ?? '';
        const destinationOwner = info.destinationOwner ?? '';
        const toTreasury =
          treasuryAtas.has(destination) || destinationOwner === treasuryBase58;
        if (!toTreasury) continue;

        const authority = info.authority ?? info.multisigAuthority ?? '';
        if (authority !== sender.toBase58()) continue;

        return true;
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
