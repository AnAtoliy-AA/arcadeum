import { SCHEMA_LANGUAGE_MAP } from './schemaLanguageMap';
import type { Locale } from '@/shared/i18n';

/**
 * Build a schema.org VideoObject for an embedded YouTube clip (e.g. the
 * home-page platform overview). Helps Google index the video and surface
 * it in Video search results, complementing the in-page iframe.
 *
 * Inputs are kept minimal — pass the 11-char YouTube ID, a localized
 * name + description, and an optional upload date. The helper composes
 * canonical watch/embed/thumbnail URLs from the ID.
 */
export function buildVideoObjectJsonLd({
  locale,
  youtubeId,
  name,
  description,
  uploadDate,
}: {
  locale: Locale;
  /** 11-char YouTube ID (no URL). */
  youtubeId: string;
  name: string;
  description: string;
  /** ISO date the video was published. Required by Google for VideoObject rich results. */
  uploadDate: string;
}): Record<string, unknown> {
  const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}`;
  const thumbnail = `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;

  const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(uploadDate)
    ? `${uploadDate}T00:00:00+00:00`
    : uploadDate;

  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    inLanguage: SCHEMA_LANGUAGE_MAP[locale],
    thumbnailUrl: [thumbnail],
    contentUrl: watchUrl,
    embedUrl,
    uploadDate: normalizedDate,
  };
  return node;
}
