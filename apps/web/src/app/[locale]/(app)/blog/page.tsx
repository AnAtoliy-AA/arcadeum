import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildCollectionPageJsonLd } from '@/shared/seo/collectionPageJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { getPosts } from '@/features/blog/registry';
import BlogClient from './BlogClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'blog' }) : {};
}

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
  const rawPosts = getPosts(locale);

  const posts = rawPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    publishedAt: p.publishedAt,
    readingTimeMinutes: p.readingTimeMinutes,
    href: routes.blogPost(p.slug),
    tags: p.tags,
  }));

  const collectionPage = buildCollectionPageJsonLd({
    locale,
    pageUrl: routes.blog,
    name: messages.seo?.blog?.title ?? 'Blog',
    description: messages.seo?.blog?.description,
    items: posts.map((p) => ({
      name: p.title,
      url: `${appConfig.siteUrl}${p.href}`,
      description: p.excerpt,
    })),
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
      <BlogClient t={t} posts={posts} locale={locale} />
    </>
  );
}
