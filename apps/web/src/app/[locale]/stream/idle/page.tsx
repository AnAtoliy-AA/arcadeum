import type { Metadata } from 'next';
import { IdleScene } from '@/features/stream/ui/IdleScene';
import {
  parseCaptionLang,
  parseDebug,
  parseGameId,
  parseOverlayOptions,
  parseSeconds,
  sanitizeText,
  type RawSearchParams,
} from '@/features/stream/lib/streamConfig';

export const metadata: Metadata = {
  title: 'Arcadeum Live',
  robots: { index: false, follow: false, noarchive: true },
};

interface PageProps {
  searchParams: Promise<RawSearchParams>;
}

/**
 * Between-games scene (`/{locale}/stream/idle`). Query params are written by
 * the stream director; each one is validated here so arbitrary text never
 * reaches the broadcast.
 */
export default async function StreamIdleRoute({ searchParams }: PageProps) {
  const query = await searchParams;
  parseCaptionLang(query.lang); // English only for now; accepted for forward compat.
  return (
    <IdleScene
      nextGameId={parseGameId(query.next)}
      lastGameId={parseGameId(query.last)}
      result={sanitizeText(query.result)}
      seconds={parseSeconds(query.seconds)}
      debug={parseDebug(query.debug)}
      overlay={parseOverlayOptions(query)}
    />
  );
}
