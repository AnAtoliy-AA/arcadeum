import Link from 'next/link';
import type { Metadata } from 'next';
import { cancelGemPurchase } from '@/features/gems/server/gems.actions';

export const metadata: Metadata = {
  title: 'Gem Purchase Cancelled · Arcadeum',
  description: 'Your gem purchase was cancelled.',
};

interface SearchParams {
  // PayPal redirects with `?token=ORDER_ID` on cancel as well as success.
  token?: string;
}

export default async function GemPurchaseCancelPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const orderId = sp.token;

  // If we have an order id, mark the row as cancelled so it doesn't sit
  // in the player's pending banner. Idempotent / silent on errors — the
  // worst case is the row stays pending and the player can clear it from
  // the wallet page's Cancel button.
  if (orderId && typeof orderId === 'string') {
    await cancelGemPurchase({ orderId });
  }

  return (
    <main
      style={{
        maxWidth: 560,
        margin: '0 auto',
        padding: '48px 16px',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#e4e4e7',
          marginBottom: 12,
        }}
      >
        Purchase cancelled
      </h1>
      <p style={{ fontSize: 15, color: '#d4d4d8', lineHeight: 1.5 }}>
        No charge was made. You can pick a different package or try again any
        time.
      </p>
      {orderId ? (
        <p style={{ fontSize: 12, color: '#71717a', marginTop: 12 }}>
          PayPal token: <code>{orderId}</code>
        </p>
      ) : null}
      <div style={{ marginTop: 24 }}>
        <Link
          href="/wallet"
          style={{
            display: 'inline-block',
            padding: '10px 18px',
            borderRadius: 8,
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.4)',
            color: '#a78bfa',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Open wallet
        </Link>
      </div>
    </main>
  );
}
