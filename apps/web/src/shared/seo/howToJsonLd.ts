import { appConfig } from '@/shared/config/app-config';
import { SCHEMA_LANGUAGE_MAP } from './schemaLanguageMap';
import type { Locale } from '@/shared/i18n';

export interface HowToStepInput {
  name: string;
  text: string;
  /** Optional anchor URL (fragment) so each step links to its section. */
  url?: string;
}

/**
 * Build a Schema.org `HowTo` node. Eligible for Google's step-by-step
 * rich result, which renders each step as a visible card in the SERP
 * and significantly boosts click-through on instructional queries
 * ("how to play X", "X rules", "X strategy").
 *
 * Steps must mirror visible content on the page — Google's manual
 * action team treats fabricated HowTo schema as a spam signal.
 */
export function buildHowToJsonLd({
  locale,
  pageUrl,
  name,
  description,
  totalTime,
  steps,
  image,
}: {
  locale: Locale;
  /** Path-relative or absolute URL of the host page. */
  pageUrl: string;
  name: string;
  description?: string;
  /** ISO 8601 duration. Optional. */
  totalTime?: string;
  steps: HowToStepInput[];
  /** Absolute image URL. Defaults to the site logo. */
  image?: string;
}): Record<string, unknown> | null {
  if (!steps.length) return null;

  const fullPageUrl = pageUrl.startsWith('http')
    ? pageUrl
    : `${appConfig.siteUrl}${pageUrl}`;
  const fullImage = image ?? `${appConfig.siteUrl}/logo.png`;

  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    inLanguage: SCHEMA_LANGUAGE_MAP[locale],
    image: fullImage,
    mainEntityOfPage: fullPageUrl,
    step: steps.map((s, index) => {
      const step: Record<string, unknown> = {
        '@type': 'HowToStep',
        position: index + 1,
        name: s.name,
        text: s.text,
      };
      if (s.url) {
        step.url = s.url.startsWith('http')
          ? s.url
          : `${fullPageUrl}${s.url.startsWith('#') ? s.url : `#${s.url}`}`;
      }
      return step;
    }),
  };

  if (description) node.description = description;
  if (totalTime) node.totalTime = totalTime;

  return node;
}
