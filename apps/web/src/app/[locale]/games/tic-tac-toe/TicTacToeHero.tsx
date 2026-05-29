import Link from 'next/link';

interface Props {
  title: string;
  subtitle: string;
  createRoomHref: string;
  roomsHref: string;
  createRoomLabel: string;
  browseRoomsLabel: string;
}

export function TicTacToeHero({
  title,
  subtitle,
  createRoomHref,
  roomsHref,
  createRoomLabel,
  browseRoomsLabel,
}: Props) {
  // Static demo grid — deliberately simple, no client JS. The hero is
  // a server component; theme cycling is wired in heroVariantContext if a
  // client subscriber is added later. For now the grid renders a fixed
  // mid-game snapshot to suggest the game without animation overhead.
  const demoBoard: Array<Array<'x' | 'o' | null>> = [
    ['x', null, 'o'],
    [null, 'x', null],
    ['o', null, 'x'],
  ];

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.85fr)',
        gap: 48,
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1
          style={{
            fontSize: 'clamp(28px, 4.4vw, 52px)',
            lineHeight: 1.1,
            fontWeight: 900,
            margin: 0,
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: 18, opacity: 0.85, margin: 0, maxWidth: 540 }}>
          {subtitle}
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            href={createRoomHref}
            style={{
              padding: '14px 24px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              color: 'white',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            {createRoomLabel}
          </Link>
          <Link
            href={roomsHref}
            style={{
              padding: '14px 24px',
              borderRadius: 12,
              border: '1px solid currentColor',
              color: 'inherit',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            {browseRoomsLabel}
          </Link>
        </div>
      </div>

      <div
        aria-hidden
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          padding: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 16,
          aspectRatio: '1 / 1',
          maxWidth: 360,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {demoBoard.flat().map((cell, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              fontWeight: 800,
              color:
                cell === 'x'
                  ? '#fb7185'
                  : cell === 'o'
                    ? '#60a5fa'
                    : 'transparent',
            }}
          >
            {cell === 'x' ? '✕' : cell === 'o' ? '○' : ' '}
          </div>
        ))}
      </div>
    </section>
  );
}
