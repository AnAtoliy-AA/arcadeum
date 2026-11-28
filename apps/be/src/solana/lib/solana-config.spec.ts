import type { ConfigService } from '@nestjs/config';
import { readSolanaConfig, redactRpcUrl } from './solana-config';
import { DEFAULT_ARC_POOL_ADDRESS } from './arcadeum-token';

const MINT = '7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCtpuiJgxHjpump';
const TREASURY = 'BHYF1uFfwujrZyLrAQw3vZJQFQ6XEkRk4TNxHo8kTTXj';

const cfg = (env: Record<string, string>) =>
  readSolanaConfig({ get: (k: string) => env[k] } as unknown as ConfigService);

describe('readSolanaConfig', () => {
  it('is clean with a full valid configuration', () => {
    const c = cfg({
      ARCADEUM_MINT_ADDRESS: MINT,
      SOLANA_TREASURY_ADDRESS: TREASURY,
      SOLANA_RPC_URL: 'https://rpc.example/key',
    });
    expect(c.issues).toEqual([]);
    expect(c.mint).toBe(MINT);
  });

  it('missing mint is an explicit issue, never a System Program fallback', () => {
    const c = cfg({ SOLANA_TREASURY_ADDRESS: TREASURY });
    expect(c.mint).toBeNull();
    expect(c.issues.join()).toMatch(/ARCADEUM_MINT_ADDRESS is not set/);
  });

  it('invalid mint (placeholder from .env.example) is an explicit issue', () => {
    const c = cfg({ ARCADEUM_MINT_ADDRESS: 'your_token_mint_address_here' });
    expect(c.mint).toBeNull();
    expect(c.issues.join()).toMatch(/not a valid base58/);
  });

  it('flags missing treasury and a missing RPC url (public RPC fallback)', () => {
    const c = cfg({ ARCADEUM_MINT_ADDRESS: MINT });
    expect(c.issues.join()).toMatch(/SOLANA_TREASURY_ADDRESS is not set/);
    expect(c.issues.join()).toMatch(/SOLANA_RPC_URL is not set/);
    expect(c.rpcConfigured).toBe(false);
    expect(c.rpcUrls).toEqual(['https://api.mainnet-beta.solana.com']);
  });

  it('adds fallback RPC urls after the primary, deduplicated', () => {
    const c = cfg({
      SOLANA_RPC_URL: 'https://a',
      SOLANA_RPC_FALLBACK_URLS: 'https://b, https://a ,https://c',
    });
    expect(c.rpcUrls).toEqual(['https://a', 'https://b', 'https://c']);
  });

  it('defaults the pool to the shared constant and honours an override', () => {
    expect(cfg({}).poolAddress).toBe(DEFAULT_ARC_POOL_ADDRESS);
    expect(cfg({ ARCADEUM_POOL_ADDRESS: TREASURY }).poolAddress).toBe(TREASURY);
    expect(cfg({ ARCADEUM_POOL_ADDRESS: 'nope' }).poolAddress).toBe(
      DEFAULT_ARC_POOL_ADDRESS,
    );
  });

  it('tolerance defaults to exact (0) and is capped at 10 percent', () => {
    expect(cfg({}).tolerancePercent).toBe(0);
    expect(cfg({ ARC_PAYMENT_TOLERANCE_PERCENT: '2' }).tolerancePercent).toBe(
      2,
    );
    expect(cfg({ ARC_PAYMENT_TOLERANCE_PERCENT: '90' }).tolerancePercent).toBe(
      10,
    );
  });

  it('redacts RPC urls to the host (keys live in path/query)', () => {
    expect(redactRpcUrl('https://rpc.example/v2/SECRETKEY?api-key=abc')).toBe(
      'rpc.example',
    );
  });
});
