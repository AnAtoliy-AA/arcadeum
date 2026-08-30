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

export function TicTacToeHero({
  title,
  subtitle,
  gameId,
  roomsHref,
  ctaQuickplayLabel,
  ctaQuickplayErrorLabel,
  browseRoomsLabel,
}: Props) {
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
