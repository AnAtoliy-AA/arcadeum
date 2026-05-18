import Link from 'next/link';
import type { Metadata } from 'next';
import { cancelGemPurchase } from '@/features/gems/server/gems.actions';

export const metadata: Metadata = {
  title: 'Gem Purchase Cancelled · Arcadeum',
  description: 'Your gem purchase was cancelled.',
};

interface SearchParams {
  token?: string;
}

const ANIMATIONS = `
  @keyframes gem-cancel-fade-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes gem-cancel-pop {
    0%   { transform: scale(0.7); opacity: 0; }
    100% { transform: scale(1);   opacity: 1; }
  }
  .gem-cancel-card { animation: gem-cancel-fade-in 0.4s ease-out both; }
  .gem-cancel-icon {
    animation: gem-cancel-pop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  }
`;

export default async function GemPurchaseCancelPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const orderId = sp.token;

  // If we have an order id, mark the row cancelled so it doesn't sit in the
  // player's Verify banner. Idempotent / silent on errors.
  if (orderId && typeof orderId === 'string') {
    await cancelGemPurchase({ orderId });
  }

  return (
    <>
      <style>{ANIMATIONS}</style>
      <main
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 16px',
        }}
      >
        <div
          className="gem-cancel-card"
          style={{
            maxWidth: 480,
            width: '100%',
            padding: '40px 32px',
            borderRadius: 24,
            background:
              'linear-gradient(180deg, rgba(148,163,184,0.05) 0%, rgba(148,163,184,0.02) 100%)',
            border: '1px solid rgba(148,163,184,0.18)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            className="gem-cancel-icon"
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, rgba(148,163,184,0.2), rgba(148,163,184,0.08))',
              border: '1px solid rgba(148,163,184,0.3)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
            }}
          >
            ✕
          </div>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: '#f4f4f5',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Purchase cancelled
          </h1>

          <p
            style={{
              fontSize: 15,
              color: '#d4d4d8',
              lineHeight: 1.5,
              margin: 0,
              maxWidth: 360,
            }}
          >
            No charge was made. You can pick a different package or try again
            any time.
          </p>

          {orderId ? (
            <code
              style={{
                fontSize: 11,
                color: '#71717a',
                background: 'rgba(0,0,0,0.3)',
                padding: '6px 10px',
                borderRadius: 6,
                fontFamily: 'ui-monospace, monospace',
                marginTop: 4,
                wordBreak: 'break-all',
              }}
            >
              {orderId}
            </code>
          ) : null}

          <div
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Link
              href="/wallet"
              style={{
                display: 'inline-block',
                padding: '11px 22px',
                borderRadius: 10,
                background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(124,58,237,0.4)',
                color: '#a78bfa',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Open wallet
            </Link>
            <Link
              href="/wallet#buy-gems"
              style={{
                display: 'inline-block',
                padding: '11px 22px',
                borderRadius: 10,
                background: 'transparent',
                border: '1px solid rgba(148,163,184,0.3)',
                color: '#a1a1aa',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Try again
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
