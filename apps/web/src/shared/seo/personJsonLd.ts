import { appConfig } from '@/shared/config/app-config';

/**
 * Build a schema.org Person for a real human (founder, team member,
 * content author). Useful E-A-T signal — Google associates authored
 * content with a known entity.
 */
export function buildPersonJsonLd({
  name,
  jobTitle,
  description,
  url,
  sameAs,
  image,
  worksFor = { name: appConfig.appName, url: appConfig.siteUrl },
}: {
  name: string;
  /** A single role or, when the person wears multiple hats, an array. */
  jobTitle?: string | string[];
  description?: string;
  /** Canonical profile URL (LinkedIn, personal site, etc.). */
  url?: string;
  /** Additional profile URLs (`sameAs`). */
  sameAs?: string[];
  /** Absolute or root-relative image URL. */
  image?: string;
  worksFor?: { name: string; url: string } | null;
}): Record<string, unknown> {
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
  };
  if (jobTitle) node.jobTitle = jobTitle;
  if (description) node.description = description;
  if (url) node.url = url;
  if (sameAs && sameAs.length > 0) node.sameAs = sameAs;
  if (image) {
    node.image = image.startsWith('http')
      ? image
      : `${appConfig.siteUrl}${image.startsWith('/') ? image : `/${image}`}`;
  }
  if (worksFor) {
    node.worksFor = {
      '@type': 'Organization',
      name: worksFor.name,
      url: worksFor.url,
    };
  }
  return node;
}
