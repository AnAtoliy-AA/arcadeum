import { appConfig } from '@/shared/config/app-config';
import { SCHEMA_LANGUAGE_MAP } from './schemaLanguageMap';
import type { Locale } from '@/shared/i18n';

/**
 * Build a Schema.org `BlogPosting` node for a single article. Google
 * surfaces the headline, datePublished, author, image, and `wordCount`
 * in rich-result previews when present, which is the difference
 * between a generic blue link and a richer card in the SERP.
 *
 * `mainEntityOfPage` ties the schema to a specific URL (rather than the
 * domain root); `inLanguage` ensures the snippet only appears in the
 * matching language's search results.
 */
export function buildBlogPostJsonLd({
  locale,
  pageUrl,
  title,
  excerpt,
  publishedAt,
  updatedAt,
  author,
  tags,
  readingTimeMinutes,
  wordCount,
  image,
}: {
  locale: Locale;
  /** Path-relative URL (`/en/blog/...`) or absolute URL. */
  pageUrl: string;
  title: string;
  excerpt: string;
  /** ISO date. */
  publishedAt: string;
  /** ISO date. Falls back to publishedAt when omitted. */
  updatedAt?: string;
  author: string;
  tags: string[];
  readingTimeMinutes: number;
  /** Optional precomputed word count for `wordCount` field. */
  wordCount?: number;
  /** Absolute URL to a representative image. Defaults to the site logo. */
  image?: string;
}): Record<string, unknown> {
  const fullPageUrl = pageUrl.startsWith('http')
    ? pageUrl
    : `${appConfig.siteUrl}${pageUrl}`;
  const fullImage = image ?? `${fullPageUrl}/opengraph-image`;

  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${fullPageUrl}#article`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullPageUrl,
    },
    headline: title,
    description: excerpt,
    inLanguage: SCHEMA_LANGUAGE_MAP[locale],
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    author: {
      '@type': 'Organization',
      name: author,
      url: appConfig.siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: appConfig.appName,
      url: appConfig.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${appConfig.siteUrl}/logo.png`,
      },
    },
    image: fullImage,
    url: fullPageUrl,
    keywords: tags.join(', '),
    // ISO 8601 duration — "5 min read" derives from this.
    timeRequired: `PT${readingTimeMinutes}M`,
  };

  if (wordCount) node.wordCount = wordCount;

  return node;
}
