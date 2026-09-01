'use client';

import { useHeroBackgroundStore } from '../store/heroBackgroundStore';

const GLOW_CLASSES: Record<string, string> = {
  sea_battle_v1:
    'bg-[radial-gradient(circle_at_65%_45%,rgba(56,189,248,0.25)_0%,transparent_60%)]',
  chess_v1:
    'bg-[radial-gradient(circle_at_65%_45%,rgba(250,204,21,0.22)_0%,transparent_60%)]',
  cascade_v1:
    'bg-[radial-gradient(circle_at_65%_45%,rgba(192,132,252,0.25)_0%,transparent_60%)]',
};

const DEFAULT_GLOW_CLASS =
  'bg-[radial-gradient(circle_at_65%_45%,rgba(20,184,166,0.18)_0%,transparent_60%)]';

export function HeroAmbientGlow() {
  const activeGameId = useHeroBackgroundStore((s) => s.activeGameId);
  const glowClass =
    (activeGameId && GLOW_CLASSES[activeGameId]) || DEFAULT_GLOW_CLASS;

  return (
    <div
      className={`hero-dynamic-ambient pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out ${glowClass}`}
    />
  );
}
