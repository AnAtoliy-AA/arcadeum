import Link from 'next/link';

interface Props {
  title: string;
  subtitle: string;
  createRoomHref: string;
  roomsHref: string;
  createRoomLabel: string;
  browseRoomsLabel: string;
}

// Static three-card fan that signals the Cascade silhouette. No client JS;
// renders as part of the server component so the hero remains cache-friendly.
const FAN = [
  { color: '#dc2626', label: '7', rotate: -16, dx: -120 },
  { color: '#fbbf24', label: '+2', rotate: 0, dx: 0 },
  { color: '#3b82f6', label: '↻', rotate: 16, dx: 120 },
];

export function CascadeHero({
  title,
  subtitle,
  createRoomHref,
  roomsHref,
  createRoomLabel,
  browseRoomsLabel,
}: Props) {
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
              background: 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)',
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
          position: 'relative',
          width: '100%',
          maxWidth: 420,
          aspectRatio: '1 / 1',
          margin: '0 auto',
          background:
            'radial-gradient(circle at 30% 30%, #312e81 0%, #0c0a1e 70%)',
          borderRadius: 24,
          overflow: 'hidden',
          padding: 16,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {FAN.map((c, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 120,
                height: 180,
                background: c.color,
                borderRadius: 16,
                border: '3px solid rgba(255,255,255,0.18)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
                transform: `translate(${c.dx}px, 0) rotate(${c.rotate}deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 64,
                fontWeight: 900,
                color: 'white',
              }}
            >
              {c.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
