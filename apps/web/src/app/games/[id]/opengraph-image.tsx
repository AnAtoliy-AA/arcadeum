import { gameMetadata } from '@/features/games/gameMetadata';
import type { GameSlug } from '@/features/games/registry.types';
import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from '@/shared/seo/openGraphImage';

export const runtime = 'edge';
export const alt = 'Game details on Arcadeum';
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

interface Props {
  params: { id: string };
}

export default async function OgImage({ params }: Props) {
  const { id } = params;
  const meta = gameMetadata[id as GameSlug];
  return renderOgImage({
    kicker: meta?.category ?? 'Game',
    heading: meta?.name ?? 'Game details',
    description: meta?.description,
  });
}
