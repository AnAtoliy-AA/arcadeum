import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BroadcastScene } from '@/features/stream/ui/BroadcastScene';
import {
  isValidRoomId,
  parseCaptionLang,
  parseDebug,
  parseOverlayOptions,
  type RawSearchParams,
} from '@/features/stream/lib/streamConfig';

export const metadata: Metadata = {
  title: 'Arcadeum Live',
  robots: { index: false, follow: false, noarchive: true },
};

interface PageProps {
  params: Promise<{ locale: string; roomId: string }>;
  searchParams: Promise<RawSearchParams>;
}

/**
 * Chrome-less 16:9 broadcast scene for one room (`/{locale}/stream/{roomId}`).
 * Header, footer and floating widgets are suppressed in the layouts via the
 * `x-arcadeum-stream` request header set by the proxy.
 */
export default async function StreamGameRoute({
  params,
  searchParams,
}: PageProps) {
  const { roomId } = await params;
  const query = await searchParams;
  if (!isValidRoomId(roomId)) notFound();
  parseCaptionLang(query.lang); // English only for now; accepted for forward compat.
  return (
    <BroadcastScene
      roomId={roomId}
      debug={parseDebug(query.debug)}
      overlay={parseOverlayOptions(query)}
    />
  );
}
