import Link from 'next/link';
import { QuickplayButton } from '@/features/games/ui/QuickplayButton';

interface Props {
  title: string;
  subtitle: string;
  gameId: string;
  roomsHref: string;
  ctaQuickplayLabel: string;
  ctaQuickplayErrorLabel: string;
  browseRoomsLabel: string;
}

export function CatDashHero({
  title,
  subtitle,
  gameId,
  roomsHref,
  ctaQuickplayLabel,
  ctaQuickplayErrorLabel,
  browseRoomsLabel,
}: Props) {
  const trackSpaces = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const spaceTypes: Array<'normal' | 'obstacle' | 'bonus'> = [
    'normal',
    'normal',
    'bonus',
    'normal',
    'obstacle',
    'normal',
    'bonus',
    'normal',
    'normal',
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
          <QuickplayButton
            gameId={gameId}
            label={ctaQuickplayLabel}
            mode="ai"
            errorLabel={ctaQuickplayErrorLabel}
          />
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
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 16,
          maxWidth: 360,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 4,
            flexWrap: 'nowrap',
            overflow: 'hidden',
            borderRadius: 10,
            border: '2px solid rgba(124, 58, 237, 0.4)',
          }}
        >
          {trackSpaces.map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 6,
                background:
                  spaceTypes[i] === 'obstacle'
                    ? 'rgba(220, 38, 38, 0.4)'
                    : spaceTypes[i] === 'bonus'
                      ? 'rgba(245, 158, 11, 0.4)'
                      : 'rgba(124, 58, 237, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {spaceTypes[i] === 'obstacle'
                ? '🔴'
                : spaceTypes[i] === 'bonus'
                  ? '🟡'
                  : ''}
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            marginTop: 8,
          }}
        >
          <span style={{ fontSize: 40 }}>🐱</span>
          <span
            style={{
              fontSize: 32,
              background: 'rgba(124, 58, 237, 0.3)',
              borderRadius: 8,
              padding: '4px 12px',
              fontWeight: 800,
            }}
          >
            🎲
          </span>
          <span style={{ fontSize: 40 }}>🏁</span>
        </div>
      </div>
    </section>
  );
}
