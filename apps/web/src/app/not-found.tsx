import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        gap: '24px',
      }}
    >
      <h1
        style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          margin: 0,
          fontWeight: 700,
        }}
      >
        Page not found
      </h1>
      <p style={{ maxWidth: 560, margin: 0, opacity: 0.8, lineHeight: 1.5 }}>
        The page you&apos;re looking for doesn&apos;t exist. Browse our games or
        head back home.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/en" className="home-link-button home-link-button-primary">
          Open app
        </Link>
        <Link
          href="/en/games"
          className="home-link-button"
          style={{ opacity: 0.85 }}
        >
          Games
        </Link>
      </div>
    </main>
  );
}
