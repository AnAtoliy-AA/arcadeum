import Link from 'next/link';
import type { CheckersMessages } from '@/shared/i18n/messages/games/checkers';

type Variants = CheckersMessages['checkers_v1']['variants'];

interface Props {
  variants: Variants;
  baseHref: string;
}

const VARIANT_EMOJI: Record<keyof Variants, string> = {
  classic: '♟️',
  neon: '💡',
  wood: '🪵',
  marble: '🏛️',
  neon_glow: '🌟',
};

const VARIANT_GRADIENT: Record<keyof Variants, string> = {
  classic: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
  neon: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
  wood: 'linear-gradient(135deg, #92400e 0%, #b45309 100%)',
  marble: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
  neon_glow: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
};

export function CheckersThemesGrid({ variants, baseHref }: Props) {
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
            color: 'white',
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
