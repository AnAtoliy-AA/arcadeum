import type { Metadata } from 'next';

import { appConfig } from '@/shared/config/app-config';

export type BuildMetadataInput = {
  /**
   * Page title without the brand suffix. The root layout's `template`
   * appends ` | <AppName>` automatically.
   */
  title?: string;
  description?: string;
  /** Canonical path (e.g. `/games`). Resolved against `metadataBase`. */
  path: string;
  /** Page-specific keywords merged with the global brand keyword set. */
  keywords?: string[];
  /** Override the OG/Twitter image. Defaults to `/logo.png`. */
  image?: string;
  /** Defaults to `website`; set `article` for blog posts, `profile` for users. */
  ogType?: 'website' | 'article' | 'profile';
  /** `false` for private / auth / transactional routes that must not be indexed. */
  index?: boolean;
  /** Locale code for OG (`en_US` by default). */
  ogLocale?: string;
};

const BASE_KEYWORDS = [
  'board games',
  'online board games',
  'play board games online',
  'tabletop games',
  'multiplayer board games',
  'free online board games',
  'online board game platform',
  appConfig.appName.toLowerCase(),
];

/**
 * Single source of truth for per-page metadata. Always sets canonical, OG and
 * Twitter so social previews and search engines see a consistent picture.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const {
    title,
    description = appConfig.seoDescription,
    path,
    keywords,
    image = '/logo.png',
    ogType = 'website',
    index = true,
    ogLocale = 'en_US',
  } = input;

  const url = `${appConfig.siteUrl}${path === '/' ? '' : path}`;
  const ogTitle = title
    ? `${title} | ${appConfig.appName}`
    : appConfig.seoTitle;

  const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: path },
    keywords: keywords ? [...keywords, ...BASE_KEYWORDS] : undefined,
    openGraph: {
      type: ogType,
      locale: ogLocale,
      url,
      siteName: appConfig.appName,
      title: ogTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title ? `${title} — ${appConfig.appName}` : appConfig.appName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [image],
    },
  };

  if (!index) {
    metadata.robots = {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        'max-image-preview': 'none',
      },
    };
  }

  return metadata;
}
