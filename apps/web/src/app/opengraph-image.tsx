import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from '@/shared/seo/openGraphImage';

export const runtime = 'edge';
export const alt = 'Arcadeum — Play board games online with friends';
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgImage({
    kicker: 'Arcadeum',
    heading: 'Play board games online',
    description: 'Private rooms, automated rules, no install.',
  });
}
