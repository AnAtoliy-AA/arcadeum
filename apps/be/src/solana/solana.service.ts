import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getPlatformKeypair } from './lib/solana-keypair';
import {
  toRawAmount,
  fromRawAmount,
  ARCADEUM_DECIMALS,
  SOLANA_TOKEN_PROGRAM_IDS,
} from './lib/arcadeum-token';
import { fetchGeckoTerminalToken } from './lib/geckoterminal';
import { ArcPriceOracle, type ArcPriceQuote } from './lib/arc-price-oracle';
import {
  readSolanaConfig,
  redactRpcUrl,
  type SolanaRuntimeConfig,
} from './lib/solana-config';
import { callWithRpcFallback, ArcRpcError } from './lib/rpc-retry';
import {
  matchArcTransfer,
  type VerifyOptions,
  type VerifyReason,
  type VerifyResult,
} from './lib/arc-tx-verifier';

export type { VerifyOptions, VerifyReason, VerifyResult };

type Web3Module = typeof import('@solana/web3.js');
type SplTokenModule = typeof import('@solana/spl-token');
type Web3Connection = import('@solana/web3.js').Connection;

/** Thrown when ARC is not configured; never silently replaced by a default. */
export class ArcNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArcNotConfiguredError';
  }
}

@Injectable()
export class SolanaService implements OnModuleInit {
  private readonly logger = new Logger(SolanaService.name);
  private connections = new Map<string, Web3Connection>();
  private arcadeumMint: import('@solana/web3.js').PublicKey | null = null;
  private web3: Web3Module | null = null;
  private splToken: SplTokenModule | null = null;
  private readonly runtime: SolanaRuntimeConfig;
  private readonly oracle: ArcPriceOracle;

  private solPriceCache: { price: number; expiresAt: number } | null = null;
  private static readonly CACHE_TTL_MS = 60_000;

  constructor(private readonly config: ConfigService) {
    this.runtime = readSolanaConfig(config);
    this.oracle = new ArcPriceOracle(() => this.runtime.mint);
  }

  onModuleInit(): void {
    const r = this.runtime;
    for (const issue of r.issues) this.logger.error(`ARC config: ${issue}`);
    this.logger.log(
      `ARC config: mint=${r.mint ?? 'MISSING'} pool=${r.poolAddress} rpc=[${r.rpcUrls
        .map(redactRpcUrl)
        .join(', ')}] decimals=${ARCADEUM_DECIMALS}`,
    );
  }

  getRuntimeConfig(): SolanaRuntimeConfig {
    return this.runtime;
  }

  isArcConfigured(): boolean {
    return this.runtime.mint !== null;
  }

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

  private async connectionFor(url: string): Promise<Web3Connection> {
    let c = this.connections.get(url);
    if (!c) {
      const { Connection } = await this.loadWeb3();
      c = new Connection(url, 'confirmed');
      this.connections.set(url, c);
    }
    return c;
  }

  /** Primary RPC connection. */
  private async getConnection(): Promise<Web3Connection> {
    return this.connectionFor(this.runtime.rpcUrls[0]);
  }

  /**
   * Runs an RPC call with retry/backoff on rate limits and timeouts, then
   * falls through the configured fallback RPC URLs.
   */
  private rpc<T>(fn: (c: Web3Connection) => Promise<T>): Promise<T> {
    const [, ...fallbacks] = this.runtime.rpcUrls;
    return callWithRpcFallback(
      [
        () => this.getConnection(),
        ...fallbacks.map((u) => () => this.connectionFor(u)),
      ],
      fn,
    );
  }

  /** Probes RPC health for the status endpoint (no secrets in the result). */
  async checkRpc(): Promise<{
    ok: boolean;
    latencyMs: number;
    error?: string;
  }> {
    const t0 = Date.now();
    try {
      await this.rpc((c) => c.getSlot());
      return { ok: true, latencyMs: Date.now() - t0 };
    } catch (err) {
      return {
        ok: false,
        latencyMs: Date.now() - t0,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /** Latest signature that references `reference` (Solana Pay), if any. */
  async findReferenceSignature(
    reference: string,
  ): Promise<{ signature: string; failed: boolean } | null> {
    const { PublicKey } = await this.loadWeb3();
    const key = new PublicKey(reference);
    const sigs = await this.rpc((c) =>
      c.getSignaturesForAddress(key, { limit: 1 }),
    );
    if (sigs.length === 0) return null;
    return { signature: sigs[0].signature, failed: Boolean(sigs[0].err) };
  }

  /** Decimals of the mint as stored on chain (null when unreadable). */
  async getMintDecimalsOnChain(): Promise<number | null> {
    if (!this.runtime.mint) return null;
    const mint = await this.getArcadeumMintKey();
    const info = await this.rpc((c) => c.getParsedAccountInfo(mint));
    const data = info.value?.data;
    if (!data || Buffer.isBuffer(data)) return null;
    const decimals = (data.parsed as { info?: { decimals?: number } })?.info
      ?.decimals;
    return typeof decimals === 'number' ? decimals : null;
  }

  private async getArcadeumMintKey(): Promise<
    import('@solana/web3.js').PublicKey
  > {
    if (!this.runtime.mint) {
      throw new ArcNotConfiguredError(
        this.runtime.issues.find((i) => i.startsWith('ARCADEUM_MINT')) ??
          'ARCADEUM_MINT_ADDRESS is not configured',
      );
    }
    if (!this.arcadeumMint) {
      const { PublicKey } = await this.loadWeb3();
      this.arcadeumMint = new PublicKey(this.runtime.mint);
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

  /**
   * USD per ARC for checkout. Returns 0 (unavailable) when the mint is not
   * configured, no source answers, or the last good price is too old.
   */
  async getArcadeumPrice(): Promise<number> {
    return this.oracle.getCheckoutPrice();
  }

  /** Price plus status/source/age for the UI and the status endpoint. */
  getArcadeumQuote(): Promise<ArcPriceQuote> {
    return this.oracle.getQuote();
  }

  peekArcadeumQuote(): ArcPriceQuote {
    return this.oracle.peek();
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
    if (!this.runtime.mint) return null;
    const mintAddress = this.runtime.mint;

    try {
      const res = await fetch(
        `https://frontend-api-v3.pump.fun/coins/${mintAddress}`,
      );
      if (!res.ok) {
        this.logger.warn(`pump.fun API returned ${res.status}`);
        return this.getTokenMetadataFromGecko(mintAddress);
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
      return this.getTokenMetadataFromGecko(mintAddress);
    }
  }

  private async getTokenMetadataFromGecko(mintAddress: string) {
    try {
      const token = await fetchGeckoTerminalToken(mintAddress);
      if (!token?.name || !token.symbol) return null;
      return {
        name: token.name,
        symbol: token.symbol,
        description: '',
        image: token.image,
        pumpfunUrl: `https://pump.fun/coin/${mintAddress}`,
        marketCapUsd: token.fdvUsd,
        totalSupply: token.totalSupply,
        createdAt: null,
        twitter: null,
        website: null,
      };
    } catch {
      this.logger.warn('Failed to fetch token metadata from GeckoTerminal');
      return null;
    }
  }

  async getPlatformBalance(): Promise<{ sol: number; arcadeum: number }> {
    const { LAMPORTS_PER_SOL, PublicKey } = await this.loadWeb3();
    const { getAssociatedTokenAddress, getAccount } = await this.loadSplToken();
    const mint = await this.getArcadeumMintKey();

    const treasuryAddress = this.runtime.treasury;
    if (!treasuryAddress) {
      this.logger.warn('SOLANA_TREASURY_ADDRESS not set');
      return { sol: 0, arcadeum: 0 };
    }

    const treasuryPubkey = new PublicKey(treasuryAddress);
    const solBalance = await this.rpc((c) => c.getBalance(treasuryPubkey));

    // ARC may live under either token program: resolve both ATAs and read
    // whichever exists.
    let arcadeumBalance = 0;
    for (const programId of SOLANA_TOKEN_PROGRAM_IDS) {
      const programPublicKey = new PublicKey(programId);
      const ata = await getAssociatedTokenAddress(
        mint,
        treasuryPubkey,
        true,
        programPublicKey,
      );
      try {
        const account = await this.rpc((c) =>
          getAccount(c, ata, 'confirmed', programPublicKey),
        );
        arcadeumBalance += fromRawAmount(account.amount);
      } catch (err) {
        // A missing token account is expected (other program, or no ARC yet).
        // RPC outages must not look like an empty treasury.
        if (err instanceof ArcRpcError) throw err;
      }
    }

    return {
      sol: solBalance / LAMPORTS_PER_SOL,
      arcadeum: arcadeumBalance,
    };
  }

  /** Boolean wrapper kept for callers that only need valid/invalid. */
  async verifyTransaction(
    signature: string,
    expectedAmount: number,
    senderAddress?: string,
  ): Promise<boolean> {
    return (
      await this.verifyTransactionDetailed(signature, expectedAmount, {
        senderAddress,
      })
    ).valid;
  }

  /**
   * Verify that `signature` is a confirmed on-chain transfer of at least
   * `expectedAmount` ARC (exact mint) into the platform treasury.
   *
   * Security invariants:
   *  - The token MUST be the configured ARC mint and the `transferChecked`
   *    decimals MUST equal ARCADEUM_DECIMALS.
   *  - Funds MUST land in a treasury-owned destination.
   *  - Only parsed `transferChecked` instructions are accepted, so mint,
   *    decimals and raw amount are attested by the token program itself.
   *  - The deposit must not be older than ARC_TX_MAX_AGE_SECONDS.
   *  - With `senderAddress` the authority must match it; with
   *    `requiredReference` the Solana Pay reference must be in the tx.
   * Distinguishes "RPC unreachable" (`rpc_error`) from "not found yet"
   * (`not_found`) so callers can ask the user to retry instead of failing.
   */
  async verifyTransactionDetailed(
    signature: string,
    expectedAmount: number,
    opts: VerifyOptions = {},
  ): Promise<VerifyResult> {
    const fail = (reason: VerifyReason): VerifyResult => ({
      valid: false,
      reason,
    });
    try {
      if (!this.runtime.mint) {
        this.logger.error(
          'ARCADEUM_MINT_ADDRESS is not configured: refusing to verify deposits',
        );
        return fail('unconfigured');
      }
      const { PublicKey } = await this.loadWeb3();
      const keypair = await this.getKeypair();
      const treasuryPubkey = keypair.publicKey;
      const mint = await this.getArcadeumMintKey();

      // Fail closed when the deposit recipient and the Solana Pay recipient
      // are configured as different wallets.
      const configuredTreasury = this.runtime.treasury;
      if (
        configuredTreasury &&
        configuredTreasury !== treasuryPubkey.toBase58()
      ) {
        this.logger.error(
          'SOLANA_TREASURY_ADDRESS does not match the platform keypair public key: refusing to verify deposits',
        );
        return fail('treasury_mismatch');
      }

      const transaction = await this.rpc((c) =>
        c.getParsedTransaction(signature, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0,
        }),
      );

      if (!transaction) {
        this.logger.warn(`Transaction ${signature} not found`);
        return fail('not_found');
      }
      if (transaction.meta?.err) {
        this.logger.warn(`Transaction ${signature} failed`);
        return fail('tx_failed');
      }

      const maxAge = this.runtime.txMaxAgeSeconds;
      if (maxAge > 0 && typeof transaction.blockTime === 'number') {
        if (Date.now() / 1000 - transaction.blockTime > maxAge) {
          return fail('too_old');
        }
      }

      if (opts.requiredReference) {
        const keys = (
          transaction.transaction.message.accountKeys as unknown as Array<{
            pubkey?: { toBase58?: () => string };
          }>
        ).map((k) => k.pubkey?.toBase58?.() ?? '');
        if (!keys.includes(opts.requiredReference)) {
          return fail('reference_missing');
        }
      }

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
          // Treat as "no ATA under this program".
        }
      }
      const result = matchArcTransfer(transaction, {
        mint: mint.toBase58(),
        treasury: treasuryPubkey.toBase58(),
        treasuryAtas,
        expectedRaw: toRawAmount(expectedAmount),
        tolerancePercent: this.runtime.tolerancePercent,
        tokenProgramIds: SOLANA_TOKEN_PROGRAM_IDS,
        senderAddress: opts.senderAddress,
      });
      if (!result.valid) {
        this.logger.warn(`No matching ARC transfer found (${result.reason})`);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to verify transaction: ${message}`);
      return fail('rpc_error');
    }
  }
}
