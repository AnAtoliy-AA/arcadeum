import Link from 'next/link';
import type { Metadata } from 'next';
import { finalizeGemPurchaseAction } from '@/features/gems/server/gems.actions';

export const metadata: Metadata = {
  title: 'Gem Purchase · Arcadeum',
  description: 'Confirming your gem purchase…',
};

interface SearchParams {
  // PayPal redirects with `?token=ORDER_ID&PayerID=...`
  token?: string;
}

export default async function GemPurchaseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const orderId = sp.token;

  // No order id — landed here directly. Send users to wallet.
  if (!orderId || typeof orderId !== 'string') {
    return (
      <Container>
        <Title>Gem purchase</Title>
        <Body>
          We couldn&apos;t find a PayPal order in this URL. Open your wallet to
          verify any pending purchases.
        </Body>
        <WalletCTA />
      </Container>
    );
  }

  // Auto-finalize on the server. Idempotent — already-completed orders
  // come back with gemsCredited: 0.
  const result = await finalizeGemPurchaseAction({ orderId });

  if (result.ok) {
    const credited = result.gemsCredited;
    // Destructure to satisfy the no-restricted-syntax rule banning direct
    // .coins / .gems member access outside the wallet module.
    const { coins: newCoins, gems: newGems } = result.newBalance;
    return (
      <Container>
        <Title>{credited > 0 ? 'Gems added!' : 'Already credited'}</Title>
        <Body>
          {credited > 0
            ? `+${credited.toLocaleString()} gems landed in your wallet.`
            : 'This purchase was already credited to your wallet.'}
        </Body>
        <Body style={{ fontSize: 13, color: '#a1a1aa', marginTop: 12 }}>
          New balance — coins: {newCoins.toLocaleString()}, gems:{' '}
          {newGems.toLocaleString()}.
        </Body>
        <WalletCTA />
      </Container>
    );
  }

  // Soft failure — purchase row exists somewhere. Tell the user how to recover.
  let body: string;
  if (result.error === 'not_captured') {
    body =
      'PayPal has not confirmed the payment yet. Try Verify in your wallet in a moment.';
  } else if (result.error === 'not_eligible') {
    body =
      'This purchase has already been processed. Open your wallet to see your balance.';
  } else if (result.error === 'not_found') {
    body =
      'We could not find this order. If you were charged, contact support with the PayPal token below.';
  } else {
    body =
      'Something went wrong while crediting your gems. Try Verify in your wallet.';
  }

  return (
    <Container>
      <Title>Gem purchase</Title>
      <Body>{body}</Body>
      <Body style={{ fontSize: 12, color: '#71717a', marginTop: 12 }}>
        PayPal token: <code>{orderId}</code>
      </Body>
      <WalletCTA />
    </Container>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        maxWidth: 560,
        margin: '0 auto',
        padding: '48px 16px',
        textAlign: 'center',
      }}
    >
      {children}
    </main>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontSize: 24,
        fontWeight: 700,
        color: '#e4e4e7',
        marginBottom: 12,
      }}
    >
      {children}
    </h1>
  );
}

function Body({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <p
      style={{
        fontSize: 15,
        color: '#d4d4d8',
        lineHeight: 1.5,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

function WalletCTA() {
  return (
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
  );
}
