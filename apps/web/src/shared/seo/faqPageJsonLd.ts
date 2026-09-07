import { appConfig } from '@/shared/config/app-config';

interface FaqItem {
  question: string;
  answer: string;
}

interface BuildFaqPageJsonLdInput {
  pageName: string;
  pageUrl: string;
  faqs: FaqItem[];
}

/**
 * Build a FAQPage + BreadcrumbList structured data block for game landing
 * pages that include FAQ sections. Matches the schema Google uses to render
 * FAQ rich results in SERPs.
 */
export function buildFaqPageJsonLd({
  pageName,
  pageUrl,
  faqs,
}: BuildFaqPageJsonLdInput): Record<string, unknown>[] {
  if (faqs.length === 0) return [];

  // FAQPage schema is restricted to government/healthcare sites (Aug 2023).
  // Only emit the BreadcrumbList for game landing pages.
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: appConfig.siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Games',
          item: `${appConfig.siteUrl}/en/games`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: pageName,
          item: pageUrl,
        },
      ],
    },
  ];
}
