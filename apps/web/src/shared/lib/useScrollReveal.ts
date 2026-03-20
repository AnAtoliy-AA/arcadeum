'use client';

import { useEffect, useRef } from 'react';

export interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Attaches an IntersectionObserver to the returned ref.
 * When the element enters the viewport, sets data-reveal="visible" on all
 * [data-reveal] descendants — triggering CSS transitions.
 * Fires once then disconnects.
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: ScrollRevealOptions = {},
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // NOTE: [data-reveal] must be on descendants of the ref element — not on the ref element
    // itself. querySelectorAll() only traverses descendants, so data-reveal on the observer
    // target would never be selected and would silently do nothing.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll<HTMLElement>('[data-reveal]').forEach((child) => {
            child.dataset.reveal = 'visible';
          });
          observer.disconnect();
        }
      },
      {
        threshold: options.threshold ?? 0.12,
        rootMargin: options.rootMargin ?? '0px',
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return ref;
}
