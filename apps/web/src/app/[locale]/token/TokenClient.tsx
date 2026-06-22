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
    t('wallet.tokenInfo.description')
      .replace('{{name}}', displayName)
      .replace('{{ticker}}', displayTicker);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          {t('wallet.tokenPage.heroBadge')}
        </div>

        <div className={styles.tokenIcon}>
          <div className={styles.tokenIconRing} />
          {metadata?.image ? (
            <Image
              src={metadata.image}
              alt={displayName}
              width={120}
              height={120}
              className={styles.tokenIconImg}
              unoptimized
            />
          ) : (
            <div className={styles.tokenIconFallback}>A</div>
          )}
        </div>

        <h1 className={styles.heroName}>{displayName}</h1>
        <span className={styles.heroTicker}>{displayTicker}</span>

        <p className={styles.heroDescription}>{displayDescription}</p>

        <div className={styles.heroActions}>
          <Link href="/wallet" className={styles.primaryBtn}>
            🎮 {t('wallet.tokenPage.viewWallet')}
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
        </div>
      </div>

      {(metadata?.marketCapUsd != null ||
        metadata?.totalSupply ||
        metadata?.createdAt) && (
        <div className={styles.stats}>
          {metadata?.marketCapUsd != null && (
            <div className={styles.stat}>
              <span className={styles.statIcon}>📊</span>
              <span className={styles.statLabel}>
                {t('wallet.tokenPage.marketCap')}{' '}
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
              <span className={styles.statIcon}>🪙</span>
              <span className={styles.statLabel}>
                {t('wallet.tokenPage.totalSupply')}
              </span>
              <span className={styles.statValue}>
                {formatSupply(metadata.totalSupply)}
              </span>
            </div>
          )}
          {metadata?.createdAt && (
            <div className={styles.stat}>
              <span className={styles.statIcon}>📅</span>
              <span className={styles.statLabel}>
                {t('wallet.tokenPage.created')}
              </span>
              <span className={styles.statValue}>
                {formatDate(metadata.createdAt)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {t('wallet.tokenPage.howToEarn.title')}
        </h2>
        <p className={styles.sectionSubtitle}>
          {t('wallet.tokenPage.howToEarn.subtitle')}
        </p>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoCardIcon}>🏆</div>
            <h3 className={styles.infoCardTitle}>
              {t('wallet.tokenPage.howToEarn.tournamentPrizes.title')}
            </h3>
            <p className={styles.infoCardDesc}>
              {t('wallet.tokenPage.howToEarn.tournamentPrizes.description')}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {t('wallet.tokenPage.howToSpend.title')}
        </h2>
        <p className={styles.sectionSubtitle}>
          {t('wallet.tokenPage.howToSpend.subtitle')}
        </p>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoCardIcon}>🎨</div>
            <h3 className={styles.infoCardTitle}>
              {t('wallet.tokenPage.howToSpend.shopItems.title')}
            </h3>
            <p className={styles.infoCardDesc}>
              {t('wallet.tokenPage.howToSpend.shopItems.description')}
            </p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoCardIcon}>✨</div>
            <h3 className={styles.infoCardTitle}>
              {t('wallet.tokenPage.howToSpend.profileCustomization.title')}
            </h3>
            <p className={styles.infoCardDesc}>
              {t('wallet.tokenPage.howToSpend.profileCustomization.description')}
            </p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoCardIcon}>🛍️</div>
            <h3 className={styles.infoCardTitle}>
              {t('wallet.tokenPage.howToSpend.connectWallet.title')}
            </h3>
            <p className={styles.infoCardDesc}>
              {t('wallet.tokenPage.howToSpend.connectWallet.description')}
            </p>
          </div>
        </div>
      </div>

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

      {(metadata?.twitter || metadata?.website) && (
        <div className={styles.socialSection}>
          <h2 className={styles.sectionTitle}>
            {t('wallet.tokenPage.community.title')}
          </h2>
          <p className={styles.sectionSubtitle}>
            {t('wallet.tokenPage.community.subtitle')}
          </p>
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
                🌐 Website ↗
              </a>
            )}
          </div>
        </div>
      )}

      <p className={styles.disclaimer}>
        {t('wallet.tokenPage.disclaimer')}
      </p>
    </div>
  );
}
