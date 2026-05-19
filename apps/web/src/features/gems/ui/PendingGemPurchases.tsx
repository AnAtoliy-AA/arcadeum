import { getServerLocale } from '@/shared/i18n/server';
import {
  formatCurrency,
  formatDate,
  formatNumber,
} from '@/shared/i18n/formatters';
import { getPendingPurchases } from '../server/gems.server';
import { CancelGemPurchaseButton } from './CancelGemPurchaseButton';
import { VerifyGemPurchaseButton } from './VerifyGemPurchaseButton';

export async function PendingGemPurchases() {
  const locale = await getServerLocale();
  let pending = [];
  try {
    pending = await getPendingPurchases();
  } catch {
    // Unauthenticated or BE unavailable — render nothing
    return null;
  }

  if (pending.length === 0) {
    return null;
  }

  const count = pending.length;

  return (
    <section
      aria-label="Pending gem purchases"
      data-testid="pending-gem-purchases"
      style={{
        padding: '16px 20px',
        borderRadius: '12px',
        background: 'rgba(251,191,36,0.06)',
        border: '1px solid rgba(251,191,36,0.2)',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#fbbf24',
          marginBottom: '12px',
        }}
      >
        You have {count} pending purchase{count === 1 ? '' : 's'}.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {pending.map((purchase) => {
          const date = formatDate(purchase.createdAt, locale);
          const priceDisplay = formatCurrency(
            purchase.amountUsdCents / 100,
            locale,
            'USD',
          );

          return (
            <div
              key={purchase.id}
              data-testid={`pending-purchase-${purchase.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '200px' }}>
                <span style={{ fontSize: '14px', color: '#e4e4e7' }}>
                  {formatNumber(purchase['gems'], locale)} gems
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#71717a',
                    marginLeft: '8px',
                  }}
                >
                  {priceDisplay} · {date}
                </span>
              </div>
              <div style={{ display: 'inline-flex', gap: '8px' }}>
                <VerifyGemPurchaseButton orderId={purchase.paypalOrderId} />
                <CancelGemPurchaseButton orderId={purchase.paypalOrderId} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
