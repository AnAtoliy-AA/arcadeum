'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency, formatNumber } from '@/shared/i18n/formatters';
import { DEFAULT_LOCALE, type Locale } from '@/shared/config/locale-slugs';
import type { GemPackagePublic } from '../server/gems.types';
import { BuyGemsButton } from './BuyGemsButton';
import { BuyGemsWithArc } from './BuyGemsWithArc';
import { useArcPricing } from '@/features/solana-pay/hooks/useArcPricing';

interface GemPackageCardProps {
  pkg: GemPackagePublic;
  locale?: Locale;
  isAuthenticated?: boolean;
  token?: string;
}

export function GemPackageCard({
  pkg,
  locale = DEFAULT_LOCALE,
  isAuthenticated = true,
  token,
}: GemPackageCardProps) {
  const [showArcPayment, setShowArcPayment] = useState(false);
  const { pricing, calculateArcPrice } = useArcPricing();

  const priceUsd = pkg.priceUsdCents / 100;
  const priceDisplay = formatCurrency(priceUsd, locale, 'USD');
  const totalGems = pkg['gems'] + pkg['bonusGems'];
  const fmt = (n: number) => formatNumber(n, locale);
  const arcPrice = calculateArcPrice(priceUsd);
  const arcUsdEquivalent =
    priceUsd * (1 - (pricing?.discountPercent ?? 0) / 100);

  if (showArcPayment) {
    return createPortal(
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          data-testid={`gem-package-card-${pkg.id}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(20,20,30,0.98)',
            border: '1px solid rgba(124,58,237,0.3)',
            width: '100%',
            maxWidth: '360px',
            margin: 'auto',
          }}
        >
          <BuyGemsWithArc
            packageId={pkg.id}
            amount={arcPrice}
            token={token}
            onPurchased={() => setShowArcPayment(false)}
            onCancel={() => setShowArcPayment(false)}
          />
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <div
      data-testid={`gem-package-card-${pkg.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '20px',
        borderRadius: '12px',
        background: 'rgba(124,58,237,0.05)',
        border: '1px solid rgba(124,58,237,0.2)',
        minWidth: '180px',
        flex: '1 1 180px',
      }}
    >
      {/* Package name */}
      <div
        data-testid="package-name"
        style={{ fontSize: '15px', fontWeight: 700, color: '#e4e4e7' }}
      >
        {pkg.name}
      </div>

      {/* Gems count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '28px', fontWeight: 700, color: '#a78bfa' }}>
          {fmt(pkg['gems'])}
        </span>
        <span style={{ fontSize: '13px', color: '#71717a' }}>gems</span>

        {/* Bonus badge */}
        {pkg.bonusGems > 0 && (
          <span
            data-testid="bonus-badge"
            style={{
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(251,191,36,0.15)',
              color: '#fbbf24',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            +{fmt(pkg.bonusGems)} bonus
          </span>
        )}
      </div>

      {/* Total (if bonus) */}
      {pkg.bonusGems > 0 && (
        <div style={{ fontSize: '12px', color: '#71717a' }}>
          Total: {fmt(totalGems)} gems
        </div>
      )}

      {/* Price + Buy buttons — pinned to the bottom */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div
          data-testid="package-price"
          style={{ fontSize: '20px', fontWeight: 700, color: '#e4e4e7' }}
        >
          {priceDisplay}
        </div>

        {arcPrice > 0 && pricing?.gemsAllowArc !== false && (
          <div
            data-testid="arc-price"
            style={{
              fontSize: '14px',
              color: '#22c55e',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <span>or {fmt(arcPrice)} ARC</span>
            {arcUsdEquivalent < priceUsd && (
              <span style={{ fontSize: '11px', color: '#71717a' }}>
                ~{arcUsdEquivalent.toFixed(2)} USDC
              </span>
            )}
          </div>
        )}

        <BuyGemsButton packageId={pkg.id} isAuthenticated={isAuthenticated} />

        {arcPrice > 0 && pricing?.gemsAllowArc !== false && (
          <button
            type="button"
            onClick={() => setShowArcPayment(true)}
            disabled={!isAuthenticated}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#22c55e',
              color: '#fff',
              cursor: isAuthenticated ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 600,
              opacity: isAuthenticated ? 1 : 0.5,
            }}
          >
            Pay with ARC
          </button>
        )}
      </div>
    </div>
  );
}
