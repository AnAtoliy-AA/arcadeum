'use client';

import { useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import styles from './TokenInfo.module.scss';

interface Props {
  mintAddress?: string;
}

export function TokenInfo({ mintAddress }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!mintAddress) return;
    await navigator.clipboard.writeText(mintAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px 32px' }}
    >
      <div className={styles.tokenCard}>
        <div className={styles.header}>
          <div className={styles.icon}>A</div>
          <div>
            <h3 className={styles.name}>{t('wallet.tokenInfo.name')}</h3>
            <span className={styles.ticker}>
              {t('wallet.tokenInfo.ticker')}
            </span>
          </div>
        </div>

        <p className={styles.description}>
          {t('wallet.tokenInfo.description')}
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
              {copied ? t('wallet.tokenInfo.copied') : t('wallet.tokenInfo.copy')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
