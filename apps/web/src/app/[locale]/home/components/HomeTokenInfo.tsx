'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/shared/i18n/context';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useScrollReveal } from '@/shared/lib/useScrollReveal';

interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string | null;
  pumpfunUrl: string | null;
}

export default function HomeTokenInfo() {
  const { messages } = useLanguage();
  const { t } = useTranslation();
  const homeCopy = messages.home ?? {};
  const sectionRef = useScrollReveal<HTMLElement>();
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);

  useEffect(() => {
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
    void fetch(`${base}/solana/token-metadata`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.name && data?.symbol) setMetadata(data);
      })
      .catch(() => {});
  }, []);

  const title = (homeCopy as Record<string, string>).tokenTitle ?? 'Our Token';
  const subtitle =
    (homeCopy as Record<string, string>).tokenSubtitle ??
    'Powering the Arcadeum ecosystem on Solana';

  const displayName = metadata?.name ?? 'ARCADEUM GAMES';
  const displayTicker = metadata?.symbol ?? 'ARC';
  const displayDescription =
    metadata?.description ||
    t('wallet.tokenInfo.description', {
      name: displayName,
      ticker: displayTicker,
    });

  return (
    <section
      id="token"
      data-testid="token-section"
      ref={sectionRef}
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '64px 16px',
      }}
    >
      <div
        className="section-header-main"
        data-reveal
        data-reveal-delay="1"
        style={{ textAlign: 'center', marginBottom: '40px' }}
      >
        <h2
          className="section-title-main"
          style={{ fontSize: '32px', fontWeight: 700, color: '#f4f4f5' }}
        >
          {title}
        </h2>
        <p
          className="section-subtitle-main"
          style={{ fontSize: '16px', color: '#a1a1aa', marginTop: '8px' }}
        >
          {subtitle}
        </p>
      </div>

      <div
        data-reveal
        data-reveal-delay="2"
        style={{
          borderRadius: '16px',
          border: '1px solid rgba(52, 211, 153, 0.2)',
          background: 'rgba(52, 211, 153, 0.05)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {metadata?.image ? (
            <Image
              src={metadata.image}
              alt={displayName}
              width={72}
              height={72}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
              unoptimized
            />
          ) : (
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #34d399, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              A
            </div>
          )}
          <div style={{ textAlign: 'left' }}>
            <h3
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#f4f4f5',
                margin: 0,
              }}
            >
              {displayName}
            </h3>
            <span
              style={{
                fontSize: '14px',
                color: '#34d399',
                fontWeight: 600,
                background: 'rgba(52, 211, 153, 0.12)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {displayTicker}
            </span>
          </div>
        </div>

        <p
          style={{
            fontSize: '15px',
            color: '#a1a1aa',
            lineHeight: 1.7,
            maxWidth: '600px',
            margin: 0,
          }}
        >
          {displayDescription}
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/wallet"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 24px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #34d399, #059669)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
          >
            View Wallet
          </Link>
          <Link
            href="/token"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 24px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#e4e4e7',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
          >
            Learn More
          </Link>
          {metadata?.pumpfunUrl && (
            <a
              href={metadata.pumpfunUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 24px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#e4e4e7',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              pump.fun ↗
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
