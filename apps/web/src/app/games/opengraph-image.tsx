import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from '@/shared/seo/openGraphImage';

export const runtime = 'edge';
export const alt = 'Browse the Arcadeum game library';
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgImage({
    kicker: 'Game library',
    heading: 'Browse the catalogue',
    description: 'Find a room, create a game, or queue with friends.',
  });
}
