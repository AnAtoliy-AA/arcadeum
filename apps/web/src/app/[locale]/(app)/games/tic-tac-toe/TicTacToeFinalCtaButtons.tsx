import Link from 'next/link';
import { QuickplayButton } from '@/features/games/ui/QuickplayButton';

interface Props {
  gameId: string;
  roomsHref: string;
  gamesHref: string;
  ctaQuickplayLabel: string;
  ctaQuickplayErrorLabel: string;
  browseRoomsLabel: string;
}

export function TicTacToeFinalCtaButtons({
  gameId,
  roomsHref,
  gamesHref,
  ctaQuickplayLabel,
  ctaQuickplayErrorLabel,
  browseRoomsLabel,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      <QuickplayButton
        gameId={gameId}
        label={ctaQuickplayLabel}
        mode="ai"
        errorLabel={ctaQuickplayErrorLabel}
      />
      <Link
        href={roomsHref}
        style={{
          padding: '14px 28px',
          borderRadius: 12,
          border: '1px solid currentColor',
          color: 'inherit',
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        {browseRoomsLabel}
      </Link>
      <Link
        href={gamesHref}
        style={{
          padding: '14px 28px',
          borderRadius: 12,
          color: 'inherit',
          textDecoration: 'underline',
        }}
      >
        ← Games
      </Link>
    </div>
  );
}
