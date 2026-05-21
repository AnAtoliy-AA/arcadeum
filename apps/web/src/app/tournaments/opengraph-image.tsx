import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from '@/shared/seo/openGraphImage';

export const runtime = 'edge';
export const alt = 'Arcadeum tournaments';
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgImage({
    kicker: 'Tournaments',
    heading: 'Compete for rewards',
    description: 'Climb the bracket, win prizes, play with friends.',
  });
}
