'use client';

import { useState, useEffect, useRef } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import type { BlogBlock } from '@/features/blog/types';

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  blocks: BlogBlock[];
}

function extractTocItems(blocks: BlogBlock[]): TocItem[] {
  return blocks
    .filter(
      (b): b is Extract<BlogBlock, { type: 'heading' }> =>
        b.type === 'heading' && !!b.id,
    )
    .map((b) => ({ id: b.id as string, text: b.text, level: b.level }));
}

export function TableOfContents({ blocks }: TableOfContentsProps) {
  const items = extractTocItems(blocks);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const headingEls = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topMost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
          );
          setActiveId(topMost.target.id);
        }
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 },
    );

    headingEls.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items]);

  if (items.length < 3) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-24 hidden xl:block w-56 shrink-0 self-start"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--colorMuted)]">
        On this page
      </p>
      <ul className="flex flex-col gap-0.5 list-none p-0 m-0 border-l-2 border-[var(--borderColor)]">
        {items.map((item) => (
          <li key={item.id} className={cx(item.level === 3 && 'pl-3')}>
            <a
              href={`#${item.id}`}
              className={cx(
                'block pl-4 py-1 text-sm no-underline transition-all duration-150',
                activeId === item.id
                  ? 'text-[var(--primary)] font-semibold border-l-2 border-[var(--primary)] -ml-[2px]'
                  : 'text-[var(--colorMuted)] hover:text-[var(--color)]',
                item.level === 3 && 'text-xs',
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
