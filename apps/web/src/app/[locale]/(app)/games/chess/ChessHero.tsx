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

const DEMO_BOARD: Array<Array<string | null>> = [
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, 'P', null, null, null, null, null],
  [null, null, null, null, 'p', null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
];

const PIECE_DISPLAY: Record<string, string> = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

export function ChessHero({
  title,
  subtitle,
  gameId,
  roomsHref,
  ctaQuickplayLabel,
  ctaQuickplayErrorLabel,
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
          gridTemplateColumns: 'repeat(8, 1fr)',
          gridTemplateRows: 'repeat(8, 1fr)',
          gap: 2,
          padding: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 16,
          aspectRatio: '1 / 1',
          maxWidth: 360,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {DEMO_BOARD.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const isLight = (rowIdx + colIdx) % 2 === 0;
            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                style={{
                  backgroundColor: isLight
                    ? 'rgba(240, 217, 181, 0.3)'
                    : 'rgba(181, 136, 99, 0.3)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  color: cell ? 'white' : 'transparent',
                }}
              >
                {cell ? PIECE_DISPLAY[cell] : ' '}
              </div>
            );
          }),
        )}
      </div>
    </section>
  );
}
