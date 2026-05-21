import type { Locale } from '@/shared/i18n';

const SCHEMA_LANGUAGE_MAP: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  ru: 'ru-RU',
  by: 'be-BY',
};

export interface FaqQuestion {
  question: string;
  answer: string;
}

/**
 * Build a Schema.org `FAQPage` node from a list of Q&A pairs. The resulting
 * JSON-LD is eligible for Google's rich-result treatment when the Q&A is
 * also visible on the page (which is a hard requirement — emitting FAQ
 * schema without matching visible content risks a manual penalty).
 *
 * `inLanguage` is set per-locale so the snippet is shown only in the
 * matching language's SERP. The optional `pageUrl` becomes the
 * `mainEntityOfPage` value, which helps Google associate the rich result
 * with a specific URL instead of the domain root.
 */
export function buildFaqJsonLd({
  locale,
  questions,
  pageUrl,
}: {
  locale: Locale;
  questions: ReadonlyArray<FaqQuestion>;
  pageUrl?: string;
}): Record<string, unknown> | null {
  if (!questions.length) return null;

  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: SCHEMA_LANGUAGE_MAP[locale],
    mainEntity: questions.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };

  if (pageUrl) node.mainEntityOfPage = pageUrl;

  return node;
}
