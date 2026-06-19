'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/shared/lib/useTranslation';
import styles from './TokenInfo.module.scss';

interface Props {
  mintAddress?: string;
}

interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string | null;
  pumpfunUrl: string | null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function TokenInfo({ mintAddress }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);

  useEffect(() => {
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
    void fetch(`${base}/solana/token-metadata`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.name && data?.symbol) {
          setMetadata(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopy = async () => {
    if (!mintAddress) return;
    await navigator.clipboard.writeText(mintAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = metadata?.name ?? t('wallet.tokenInfo.name');
  const displayTicker = metadata?.symbol ?? t('wallet.tokenInfo.ticker');
  const displayDescription =
    metadata?.description ||
    t('wallet.tokenInfo.description', {
      name: displayName,
      ticker: displayTicker,
    });

  return (
    <div
      style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px 32px' }}
    >
      <div className={styles.tokenCard}>
        <div className={styles.header}>
          {metadata?.image ? (
            <Image
              src={metadata.image}
              alt={displayName}
              width={64}
              height={64}
              className={styles.tokenImage}
              unoptimized
            />
          ) : (
            <div className={styles.icon}>A</div>
          )}
          <div>
            <h3 className={styles.name}>{displayName}</h3>
            <span className={styles.ticker}>{displayTicker}</span>
          </div>
        </div>

        <p className={styles.description}>
          {displayDescription
            .split(
              new RegExp(
                `(${escapeRegex(displayName)}|${escapeRegex(displayTicker)})`,
                'gi',
              ),
            )
            .map((part, i) =>
              part.toLowerCase() === displayName.toLowerCase() ||
              part.toLowerCase() === displayTicker.toLowerCase() ? (
                <strong key={i} className={styles.highlight}>
                  {part}
                </strong>
              ) : (
                part
              ),
            )}
        </p>

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

        {metadata?.pumpfunUrl && (
          <a
            href={metadata.pumpfunUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.pumpfunLink}
          >
            View on pump.fun ↗
          </a>
        )}
      </div>
    </div>
  );
}
