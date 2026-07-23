import Link from 'next/link';
import type { CatDashMessages } from '@/shared/i18n/messages/games/cat-dash';

type Variants = CatDashMessages['cat_dash_v1']['variants'];

interface Props {
  variants: Variants;
  baseHref: string;
}

const VARIANT_EMOJI: Record<keyof Variants, string> = {
  neon: '🐱',
  village: '🏘️',
  space: '🚀',
  nature: '🌿',
};

const VARIANT_GRADIENT: Record<keyof Variants, string> = {
  neon: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
  village: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  space: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
  nature: 'linear-gradient(135deg, #166534 0%, #22c55e 100%)',
};

export function CatDashThemesGrid({ variants, baseHref }: Props) {
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
