'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { GameSectionNavItem } from './types';

interface GameSectionNavProps {
  items: GameSectionNavItem[];
}

/**
 * Sticky in-page navigation. Highlights the section currently in view and
 * lets visitors jump straight to rules, strategy, FAQ and so on.
 */
export function GameSectionNav({ items }: GameSectionNavProps) {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = items.find((item) => visible.has(item.id));
        if (first) setActiveId(first.id);
      },
      { rootMargin: '-96px 0px -55% 0px' },
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label={t('games.landing.onThisPage')}
      data-testid="game-section-nav"
      className="box-border sticky top-[var(--header-height,72px)] z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 border-y border-[var(--borderColor)] bg-[var(--glassBg)] backdrop-blur-xl"
    >
      <ul className="box-border m-0 p-0 list-none flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id} className="box-border shrink-0">
              <a
                href={`#${item.id}`}
                aria-current={active ? 'true' : undefined}
                onClick={() => setActiveId(item.id)}
                className={`box-border inline-flex items-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--foreground)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]'
                }`}
              >
                {t(item.labelKey)}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
