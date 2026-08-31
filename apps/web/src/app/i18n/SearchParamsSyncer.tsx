'use client';

import { useLayoutEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { Locale } from '@/shared/i18n';
import { swapLocaleInPath } from './locale-utils';

type SetLocaleFn = (next: Locale) => void;

/**
 * Isolated inside <Suspense> so that useSearchParams does not force the
 * entire page tree into client rendering (Next.js App Router requirement).
 *
 * Writes the real setLocale implementation into the ref owned by
 * LanguageProvider on every render so the stable context callback
 * always delegates to the latest navigation state.
 */
export function SearchParamsSyncer({
  locale,
  setLocaleRef,
}: {
  locale: Locale;
  setLocaleRef: React.MutableRefObject<SetLocaleFn>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useLayoutEffect(() => {
    setLocaleRef.current = (next: Locale) => {
      if (next === locale) return;
      const nextPath = swapLocaleInPath(pathname ?? `/${locale}`, next);
      const query = searchParams?.toString();
      const cookieOptions = 'path=/; max-age=31536000; SameSite=Lax';
      document.cookie = `app-language=${next}; ${cookieOptions}`;
      router.replace(query ? `${nextPath}?${query}` : nextPath);
      router.refresh();
    };
  });

  return null;
}
