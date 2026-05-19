import { formatCurrency, formatNumber } from '@/shared/i18n/formatters';
import { DEFAULT_LOCALE, type Locale } from '@/shared/config/locale-slugs';
import type { GemPackagePublic } from '../server/gems.types';
import { BuyGemsButton } from './BuyGemsButton';

interface GemPackageCardProps {
  pkg: GemPackagePublic;
  locale?: Locale;
}

export function GemPackageCard({
  pkg,
  locale = DEFAULT_LOCALE,
}: GemPackageCardProps) {
  const priceDisplay = formatCurrency(pkg.priceUsdCents / 100, locale, 'USD');
  const totalGems = pkg['gems'] + pkg['bonusGems'];
  const fmt = (n: number) => formatNumber(n, locale);

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

      {/* Price + Buy button — pinned to the bottom of the card so cards
          with different content heights (e.g. with vs without bonus row)
          still align their CTAs in a single row. */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          data-testid="package-price"
          style={{ fontSize: '20px', fontWeight: 700, color: '#e4e4e7' }}
        >
          {priceDisplay}
        </div>
        <BuyGemsButton packageId={pkg.id} />
      </div>
    </div>
  );
}
