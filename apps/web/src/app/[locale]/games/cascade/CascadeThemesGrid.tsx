import Link from 'next/link';
import type { CascadeMessages } from '@/shared/i18n/messages/games/cascade';

type Variants = CascadeMessages['cascade_v1']['variants'];

interface Props {
  variants: Variants;
  baseHref: string;
}

const VARIANT_EMOJI: Record<keyof Variants, string> = {
  cosmic: '🌌',
  arcane: '✨',
  cyberpunk: '💾',
  elemental: '🍃',
};

const VARIANT_GRADIENT: Record<keyof Variants, string> = {
  cosmic: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0c0a1e 100%)',
  arcane: 'linear-gradient(135deg, #4c1d95 0%, #be185d 50%, #1e293b 100%)',
  cyberpunk: 'linear-gradient(135deg, #0f172a 0%, #0891b2 50%, #be185d 100%)',
  elemental: 'linear-gradient(135deg, #166534 0%, #ca8a04 50%, #1e40af 100%)',
};

export function CascadeThemesGrid({ variants, baseHref }: Props) {
  const entries = Object.entries(variants) as Array<
    [keyof Variants, Variants[keyof Variants]]
  >;
  const separator = baseHref.includes('?') ? '&' : '?';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
            minHeight: 160,
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
