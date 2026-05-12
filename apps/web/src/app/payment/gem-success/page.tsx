import Link from 'next/link';
import type { Metadata } from 'next';
import { finalizeGemPurchase } from '@/features/gems/server/gems.actions';

export const metadata: Metadata = {
  title: 'Gem Purchase · Arcadeum',
  description: 'Confirming your gem purchase…',
};

interface SearchParams {
  // PayPal redirects with `?token=ORDER_ID&PayerID=...`
  token?: string;
}

// ── Animations ───────────────────────────────────────────────────────────────
const ANIMATIONS = `
  @keyframes gem-fade-in {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes gem-pop-in {
    0%   { transform: scale(0.6); opacity: 0; }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes gem-float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes gem-glow {
    0%, 100% { box-shadow: 0 0 30px rgba(167,139,250,0.35), 0 0 60px rgba(167,139,250,0.15); }
    50%      { box-shadow: 0 0 50px rgba(167,139,250,0.5),  0 0 90px rgba(167,139,250,0.25); }
  }
  @keyframes gem-sparkle {
    0%, 100% { opacity: 0; transform: scale(0); }
    50%      { opacity: 1; transform: scale(1); }
  }
  .gem-success-card {
    animation: gem-fade-in 0.45s ease-out 0.15s both;
  }
  .gem-success-icon {
    animation:
      gem-pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both,
      gem-float 4s ease-in-out 0.6s infinite,
      gem-glow 3s ease-in-out 0.6s infinite;
  }
  .gem-sparkle {
    animation: gem-sparkle 1.8s ease-in-out infinite;
  }
`;

export default async function GemPurchaseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const orderId = sp.token;

  if (!orderId || typeof orderId !== 'string') {
    return (
      <Shell variant="neutral">
        <Icon variant="neutral">?</Icon>
        <Title>Gem purchase</Title>
        <Lede>
          We couldn&apos;t find a PayPal order in this URL. Open your wallet to
          verify any pending purchases.
        </Lede>
        <Actions>
          <PrimaryLink href="/wallet">Open wallet</PrimaryLink>
        </Actions>
      </Shell>
    );
  }

  // Use the bare helper — Server Components can't trigger revalidatePath
  // during render, and we don't need it (the page IS the render).
  const result = await finalizeGemPurchase({ orderId });

  if (result.ok) {
    const credited = result.gemsCredited;
    const { coins: newCoins, gems: newGems } = result.newBalance;
    return (
      <Shell variant="success">
        <Icon variant="success">💎</Icon>
        <Title>{credited > 0 ? 'Gems added!' : 'Already credited'}</Title>
        <Lede>
          {credited > 0 ? (
            <>
              <PurpleAmount>+{credited.toLocaleString()}</PurpleAmount> gems
              landed in your wallet.
            </>
          ) : (
            'This purchase was already credited to your wallet.'
          )}
        </Lede>

        <BalanceCard coins={newCoins} gems={newGems} />

        <Actions>
          <PrimaryLink href="/wallet">Open wallet</PrimaryLink>
          <SecondaryLink href="/wallet#buy-gems">Buy more</SecondaryLink>
        </Actions>
      </Shell>
    );
  }

  // Soft failure path.
  let title = 'Gem purchase';
  let body: React.ReactNode;
  if (result.error === 'not_captured') {
    title = 'Almost there';
    body =
      'PayPal has not confirmed the payment yet. Try Verify in your wallet in a moment.';
  } else if (result.error === 'not_eligible') {
    title = 'Already handled';
    body =
      'This purchase has already been processed. Open your wallet to see your balance.';
  } else if (result.error === 'not_found') {
    title = 'Order not found';
    body =
      'We could not find this order. If you were charged, contact support with the PayPal token below.';
  } else {
    body =
      'Something went wrong while crediting your gems. Try Verify in your wallet.';
  }

  return (
    <Shell variant="warning">
      <Icon variant="warning">!</Icon>
      <Title>{title}</Title>
      <Lede>{body}</Lede>
      <TokenChip token={orderId} />
      <Actions>
        <PrimaryLink href="/wallet">Open wallet</PrimaryLink>
      </Actions>
    </Shell>
  );
}

// ── Building blocks ──────────────────────────────────────────────────────────

type Variant = 'success' | 'warning' | 'neutral';

function Shell({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: Variant;
}) {
  return (
    <>
      <style>{ANIMATIONS}</style>
      {variant === 'success' ? <SparkleField /> : null}
      <main
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 16px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          className="gem-success-card"
          style={{
            maxWidth: 520,
            width: '100%',
            padding: '40px 32px',
            borderRadius: 24,
            background:
              'linear-gradient(180deg, rgba(124,58,237,0.06) 0%, rgba(124,58,237,0.02) 100%)',
            border: '1px solid rgba(124,58,237,0.18)',
            boxShadow:
              '0 24px 60px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.04) inset',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
          }}
        >
          {children}
        </div>
      </main>
    </>
  );
}

function Icon({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: Variant;
}) {
  const palette: Record<
    Variant,
    { bg: string; border: string; color: string }
  > = {
    success: {
      bg: 'linear-gradient(135deg, rgba(167,139,250,0.25), rgba(124,58,237,0.12))',
      border: '1px solid rgba(167,139,250,0.45)',
      color: '#a78bfa',
    },
    warning: {
      bg: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.08))',
      border: '1px solid rgba(251,191,36,0.4)',
      color: '#fbbf24',
    },
    neutral: {
      bg: 'linear-gradient(135deg, rgba(148,163,184,0.18), rgba(148,163,184,0.06))',
      border: '1px solid rgba(148,163,184,0.35)',
      color: '#94a3b8',
    },
  };
  const p = palette[variant];
  return (
    <div
      className={variant === 'success' ? 'gem-success-icon' : undefined}
      style={{
        width: 92,
        height: 92,
        borderRadius: '50%',
        background: p.bg,
        border: p.border,
        color: p.color,
        fontSize: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontSize: 28,
        fontWeight: 700,
        color: '#f4f4f5',
        margin: 0,
        letterSpacing: '-0.01em',
      }}
    >
      {children}
    </h1>
  );
}

function Lede({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 16,
        color: '#d4d4d8',
        lineHeight: 1.5,
        margin: 0,
        maxWidth: 380,
      }}
    >
      {children}
    </p>
  );
}

function PurpleAmount({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        color: '#a78bfa',
        fontWeight: 700,
        fontSize: 18,
      }}
    >
      {children}
    </span>
  );
}

function BalanceCard({ coins, gems }: { coins: number; gems: number }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 24,
        padding: '14px 22px',
        borderRadius: 14,
        background: 'rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.06)',
        marginTop: 4,
      }}
    >
      <BalanceCell
        icon="🪙"
        label="Coins"
        value={coins.toLocaleString()}
        color="#fbbf24"
      />
      <Divider />
      <BalanceCell
        icon="💎"
        label="Gems"
        value={gems.toLocaleString()}
        color="#a78bfa"
      />
    </div>
  );
}

function BalanceCell({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: '#71717a',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {icon} {label}
      </span>
      <span style={{ fontSize: 22, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      style={{
        width: 1,
        alignSelf: 'stretch',
        background: 'rgba(255,255,255,0.06)',
      }}
    />
  );
}

function TokenChip({ token }: { token: string }) {
  return (
    <code
      style={{
        fontSize: 11,
        color: '#a1a1aa',
        background: 'rgba(0,0,0,0.3)',
        padding: '6px 10px',
        borderRadius: 6,
        fontFamily: 'ui-monospace, monospace',
        marginTop: 4,
        wordBreak: 'break-all',
      }}
    >
      {token}
    </code>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        marginTop: 12,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
}

function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-block',
        padding: '11px 22px',
        borderRadius: 10,
        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
        color: '#fff',
        fontSize: 14,
        fontWeight: 700,
        textDecoration: 'none',
        boxShadow: '0 6px 18px rgba(124,58,237,0.35)',
      }}
    >
      {children}
    </Link>
  );
}

function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-block',
        padding: '11px 22px',
        borderRadius: 10,
        background: 'transparent',
        border: '1px solid rgba(167,139,250,0.4)',
        color: '#a78bfa',
        fontSize: 14,
        fontWeight: 600,
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  );
}

// Subtle sparkles dotted around the success view — fixed positions so they
// look deliberate (not random noise), and they fade in/out independently.
function SparkleField() {
  const sparkles = [
    { top: '12%', left: '8%', size: 6, delay: 0 },
    { top: '20%', left: '90%', size: 4, delay: 0.4 },
    { top: '40%', left: '12%', size: 5, delay: 0.8 },
    { top: '60%', left: '88%', size: 7, delay: 0.2 },
    { top: '78%', left: '15%', size: 4, delay: 1.0 },
    { top: '82%', left: '82%', size: 5, delay: 0.6 },
  ];
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {sparkles.map((s, i) => (
        <span
          key={i}
          className="gem-sparkle"
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: '#a78bfa',
            borderRadius: '50%',
            boxShadow: '0 0 12px rgba(167,139,250,0.8)',
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
