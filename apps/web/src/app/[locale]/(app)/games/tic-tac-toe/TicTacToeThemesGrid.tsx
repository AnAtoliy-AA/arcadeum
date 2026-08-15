import Link from 'next/link';
import type { TicTacToeMessages } from '@/shared/i18n/messages/games/tic-tac-toe';

type Variants = TicTacToeMessages['tic_tac_toe_v1']['variants'];

interface Props {
  variants: Variants;
  baseHref: string;
}

const VARIANT_EMOJI: Record<keyof Variants, string> = {
  classic: '❌',
  neon: '💡',
  paper: '📝',
  pixel: '👾',
  chalkboard: '🎓',
  retro: '📺',
};

const VARIANT_GRADIENT: Record<keyof Variants, string> = {
  classic: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
  neon: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
  paper: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  pixel: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
  chalkboard: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  retro: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
};

export function TicTacToeThemesGrid({ variants, baseHref }: Props) {
  const entries = Object.entries(variants) as Array<
    [keyof Variants, Variants[keyof Variants]]
  >;
  const separator = baseHref.includes('?') ? '&' : '?';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
      }}
    >
      {entries.map(([id, copy]) => (
        <Link
          key={id}
          href={`${baseHref}${separator}variant=${id}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: 20,
            borderRadius: 16,
            background: VARIANT_GRADIENT[id],
            color: id === 'paper' ? '#451a03' : 'white',
            textDecoration: 'none',
            minHeight: 140,
          }}
        >
          <span style={{ fontSize: 32 }}>{VARIANT_EMOJI[id]}</span>
          <strong style={{ fontSize: 18 }}>{copy.name}</strong>
          <span style={{ fontSize: 13, opacity: 0.85 }}>
            {copy.description}
          </span>
        </Link>
      ))}
    </div>
  );
}
