import Link from 'next/link';

interface Props {
  createRoomHref: string;
  roomsHref: string;
  gamesHref: string;
  createRoomLabel: string;
  browseRoomsLabel: string;
}

export function CascadeFinalCtaButtons({
  createRoomHref,
  roomsHref,
  gamesHref,
  createRoomLabel,
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
      <Link
        href={createRoomHref}
        style={{
          padding: '14px 28px',
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
