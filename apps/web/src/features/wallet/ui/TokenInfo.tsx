'use client';

import { useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';

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
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '0 16px 32px',
      }}
    >
      <div
        style={{
          borderRadius: '12px',
          border: '1px solid rgba(52,211,153,0.2)',
          background: 'rgba(52,211,153,0.05)',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #34d399, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            A
          </div>
          <div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#e4e4e7',
                margin: 0,
              }}
            >
              {t('wallet.tokenInfo.name')}
            </h3>
            <span
              style={{
                fontSize: '14px',
                color: '#34d399',
                fontWeight: 600,
              }}
            >
              {t('wallet.tokenInfo.ticker')}
            </span>
          </div>
        </div>

        <p
          style={{
            fontSize: '14px',
            color: '#a1a1aa',
            lineHeight: 1.6,
            margin: '0 0 16px',
          }}
        >
          {t('wallet.tokenInfo.description')}
        </p>

        {mintAddress && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                color: '#71717a',
                whiteSpace: 'nowrap',
              }}
            >
              {t('wallet.tokenInfo.mint')}:
            </span>
            <code
              style={{
                fontSize: '12px',
                color: '#a1a1aa',
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
              }}
            >
              {mintAddress}
            </code>
            <button
              onClick={handleCopy}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: copied ? '#34d399' : '#a1a1aa',
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {copied ? t('wallet.tokenInfo.copied') : t('wallet.tokenInfo.copy')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
