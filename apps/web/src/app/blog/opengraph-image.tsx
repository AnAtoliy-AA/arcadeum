import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from '@/shared/seo/openGraphImage';

export const runtime = 'edge';
export const alt = 'Arcadeum blog';
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgImage({
    kicker: 'Blog',
    heading: 'News & design notes',
    description: 'What we are building and why.',
  });
}
