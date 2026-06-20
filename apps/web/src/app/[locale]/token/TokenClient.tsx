'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/shared/lib/useTranslation';
import styles from './TokenClient.module.scss';

interface TokenMetadata {
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
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatSupply(s: string): string {
  const n = Number(s);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return s;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TokenClient() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const mintAddress = process.env.NEXT_PUBLIC_ARCADEUM_MINT_ADDRESS ?? '';

  const fetchMetadata = (signal?: AbortSignal) => {
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
    return fetch(`${base}/solana/token-metadata`, { signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.name && data?.symbol) setMetadata(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchMetadata(controller.signal).finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMetadata();
    setRefreshing(false);
  };

  const handleCopy = async () => {
    if (!mintAddress) return;
    await navigator.clipboard.writeText(mintAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = metadata?.name ?? 'ARCADEUM GAMES';
  const displayTicker = metadata?.symbol ?? 'ARC';
  const displayDescription =
    metadata?.description ||
    'Earn tokens through gameplay, purchase them in the shop, or withdraw them to your Phantom wallet on Solana.';

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.skeleton} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          {metadata?.image ? (
            <Image
              src={metadata.image}
              alt={displayName}
              width={96}
              height={96}
              className={styles.tokenImage}
              unoptimized
            />
          ) : (
            <div className={styles.icon}>A</div>
          )}
          <div>
            <h1 className={styles.name}>{displayName}</h1>
            <span className={styles.ticker}>{displayTicker}</span>
          </div>
        </div>

        <p className={styles.description}>{displayDescription}</p>

        {(metadata?.marketCapUsd != null ||
          metadata?.totalSupply ||
          metadata?.createdAt) && (
          <div className={styles.stats}>
            {metadata?.marketCapUsd != null && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>
                  Market Cap{' '}
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className={styles.refreshBtn}
                    title="Refresh data"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={refreshing ? styles.spinning : undefined}
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      <polyline points="21 3 21 9 15 9" />
                    </svg>
                  </button>
                </span>
                <span className={styles.statValue}>
                  {formatNumber(metadata.marketCapUsd)}
                </span>
              </div>
            )}
            {metadata?.totalSupply && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total Supply</span>
                <span className={styles.statValue}>
                  {formatSupply(metadata.totalSupply)}
                </span>
              </div>
            )}
            {metadata?.createdAt && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Created</span>
                <span className={styles.statValue}>
                  {formatDate(metadata.createdAt)}
                </span>
              </div>
            )}
          </div>
        )}

        {mintAddress && (
          <div className={styles.mintRow}>
            <span className={styles.mintLabel}>
              {t('wallet.tokenInfo.mint')}:
            </span>
            <code className={styles.mintValue}>{mintAddress}</code>
            <button
              onClick={handleCopy}
              className={copied ? styles.copyBtnCopied : styles.copyBtn}
            >
              {copied
                ? t('wallet.tokenInfo.copied')
                : t('wallet.tokenInfo.copy')}
            </button>
          </div>
        )}

        <div className={styles.actions}>
          <Link href="/wallet" className={styles.primaryBtn}>
            View Wallet
          </Link>
          {metadata?.pumpfunUrl && (
            <a
              href={metadata.pumpfunUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondaryBtn}
            >
              pump.fun ↗
            </a>
          )}
          {mintAddress && (
            <a
              href={`https://solscan.io/token/${mintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondaryBtn}
            >
              Solscan ↗
            </a>
          )}
          {mintAddress && (
            <a
              href={`https://jup.ag/swap/SOL-${mintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondaryBtn}
            >
              Buy on Jupiter ↗
            </a>
          )}
        </div>

        {(metadata?.twitter || metadata?.website) && (
          <div className={styles.socialLinks}>
            {metadata?.twitter && (
              <a
                href={metadata.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                𝕏 Twitter ↗
              </a>
            )}
            {metadata?.website && (
              <a
                href={metadata.website}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                Website ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
