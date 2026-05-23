'use client';

import { useEffect, useState } from 'react';
import { getVariantStyles } from '@/widgets/CriticalGame/ui/styles/variants';

const loaded = new Set<string>();

// Returns whether the Critical variant's sprite sheet has finished loading.
// Provides a flag so callers can render a lightweight placeholder (e.g. the
// SVG poster) until the image is ready, then swap to the real sprite.
//
// The sprite URL is cached on `Image.src` by the browser, so subsequent
// thumbnails for the same variant load instantly after the first hit.
export function useSpriteLoaded(variant: string): {
  url: string | undefined;
  isLoaded: boolean;
} {
  const url = getVariantStyles(variant).cards.getCardSpriteUrl?.(variant);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(() =>
    url && loaded.has(url) ? url : null,
  );

  // Render-phase sync: when the variant changes to one whose sprite is
  // already cached, flip immediately without going through useEffect.
  if (url && loaded.has(url) && loadedUrl !== url) {
    setLoadedUrl(url);
  }

  useEffect(() => {
    if (!url || loaded.has(url)) return;
    let cancelled = false;
    const img = new Image();
    const onLoad = () => {
      if (cancelled) return;
      loaded.add(url);
      setLoadedUrl(url);
    };
    img.addEventListener('load', onLoad, { once: true });
    img.src = url;
    // If the browser already had the image cached, `complete` may be true
    // synchronously and the `load` event will not fire.
    if (img.complete && img.naturalWidth > 0) onLoad();
    return () => {
      cancelled = true;
      img.removeEventListener('load', onLoad);
    };
  }, [url]);

  return { url, isLoaded: !!url && loadedUrl === url };
}
