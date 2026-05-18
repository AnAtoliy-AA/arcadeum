import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildCollectionPageJsonLd } from '@/shared/seo/collectionPageJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import BlogClient from './BlogClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'blog' })
    : {};
}

/**
 * Blog index page. Fetches translations on the server and passes them
 * to BlogClient. Use BlogClient for client-side rendering to avoid
 * Tamagui hydration issues.
 */
export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const t = messages.pages?.blog;
  const routes = buildRoutes(locale);

  const collectionPage = buildCollectionPageJsonLd({
    locale,
    pageUrl: routes.blog,
    name: messages.seo?.blog?.title ?? 'Blog',
    description: messages.seo?.blog?.description,
    items: [],
  });
  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: messages.seo?.blog?.title ?? 'Blog',
        url: routes.blog,
      },
    ],
  });

  return (
    <>
      <JsonLd
        id={`json-ld-blog-${locale}`}
        data={[collectionPage, breadcrumb]}
      />
      <BlogClient t={t} />
    </>
  );
}
