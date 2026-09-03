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

export function CheckersHero({
  title,
  subtitle,
  gameId,
  roomsHref,
  ctaQuickplayLabel,
  ctaQuickplayErrorLabel,
  browseRoomsLabel,
}: Props) {
  const CELL_SIZE = 48;
  const BOARD_SIZE = 8;
  const board: Array<
    Array<'light' | 'dark' | 'lightPiece' | 'darkPiece' | null>
  > = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row: Array<'light' | 'dark' | 'lightPiece' | 'darkPiece' | null> = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      const isLight = (r + c) % 2 === 0;
      if (r < 3 && !isLight) row.push('darkPiece');
      else if (r >= 5 && !isLight) row.push('lightPiece');
      else row.push(isLight ? 'light' : 'dark');
    }
    board.push(row);
  }

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
          gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
          gap: 2,
          padding: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 16,
          width: 'fit-content',
          margin: '0 auto',
        }}
      >
        {board.flat().map((cell, idx) => {
          const isLight = cell === 'light' || cell === 'lightPiece';
          const isPiece = cell === 'lightPiece' || cell === 'darkPiece';
          return (
            <div
              key={idx}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                borderRadius: 6,
                backgroundColor: isLight
                  ? 'rgba(245, 245, 244, 0.15)'
                  : 'rgba(87, 83, 78, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isPiece ? (
                <div
                  style={{
                    width: CELL_SIZE * 0.7,
                    height: CELL_SIZE * 0.7,
                    borderRadius: '50%',
                    backgroundColor:
                      cell === 'lightPiece'
                        ? 'rgba(250, 250, 249, 0.9)'
                        : 'rgba(41, 37, 36, 0.9)',
                    border: `2px solid ${
                      cell === 'lightPiece'
                        ? 'rgba(168, 162, 158, 0.5)'
                        : 'rgba(28, 25, 23, 0.5)'
                    }`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
