import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import {
  isLocale,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  localeToHreflang,
  type Locale,
} from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildBlogPostJsonLd } from '@/shared/seo/blogPostJsonLd';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildHowToJsonLd } from '@/shared/seo/howToJsonLd';
import { getPost, POST_SLUGS } from '@/features/blog/registry';
import { BlogPostView } from './BlogPostView';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export async function generateStaticParams() {
  // Pre-generate (locale, slug) pairs so blog posts ship as static HTML.
  return SUPPORTED_LOCALES.flatMap((locale) =>
    POST_SLUGS.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const post = getPost(slug, locale);
  if (!post) return {};

  const routes = buildRoutes(locale);
  const pageUrl = `${appConfig.siteUrl}${routes.blogPost(slug)}`;

  // hreflang alternates for every locale that has a translation of this
  // specific slug. Locales without a translation are not listed — sending
  // Google to a fallback English page under e.g. `/ru/blog/...` would
  // confuse the language-clustering signal.
  const languages: Record<string, string> = {};
  for (const l of SUPPORTED_LOCALES) {
    if (getPost(slug, l)) {
      languages[localeToHreflang(l)] =
        `${appConfig.siteUrl}${buildRoutes(l).blogPost(slug)}`;
    }
  }
  languages['x-default'] =
    `${appConfig.siteUrl}${buildRoutes(DEFAULT_LOCALE).blogPost(slug)}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: pageUrl,
      languages,
    },
    openGraph: {
      type: 'article',
      url: pageUrl,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostRoute({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const post = getPost(slug, locale);
  if (!post) notFound();

  const routes = buildRoutes(locale);
  const pageUrl = `${appConfig.siteUrl}${routes.blogPost(slug)}`;
  const messages = await getTranslations(locale);

  // Word count is computed once on the server from the paragraph + list
  // text so the schema's `wordCount` stays in sync with the visible copy
  // without giving the renderer a slow path.
  const wordCount = post.body.reduce((total, block) => {
    if (block.type === 'paragraph') {
      return total + block.text.split(/\s+/).filter(Boolean).length;
    }
    if (block.type === 'list') {
      return (
        total +
        block.items.reduce(
          (sum, item) => sum + item.split(/\s+/).filter(Boolean).length,
          0,
        )
      );
    }
    return total;
  }, 0);

  const postJsonLd = buildBlogPostJsonLd({
    locale,
    pageUrl,
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    author: post.author,
    tags: post.tags,
    readingTimeMinutes: post.readingTimeMinutes,
    wordCount,
  });

  const blogIndexLabel = messages.seo?.blog?.title ?? 'Blog';
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      { name: blogIndexLabel, url: routes.blog },
      { name: post.title, url: routes.blogPost(slug) },
    ],
  });

  // HowTo schema is opt-in per post. Emit only when the author has
  // authored explicit, visible steps (the article must contain a
  // matching numbered list — Google's manual-action team flags HowTo
  // schema that does not mirror on-page content).
  const howToJsonLd = post.howTo
    ? buildHowToJsonLd({
        locale,
        pageUrl,
        name: post.howTo.name ?? post.title,
        description: post.excerpt,
        totalTime: post.howTo.totalTime,
        steps: post.howTo.steps,
      })
    : null;

  const jsonLdNodes: Record<string, unknown>[] = [postJsonLd, breadcrumbJsonLd];
  if (howToJsonLd) jsonLdNodes.push(howToJsonLd);

  return (
    <>
      <JsonLd id={`json-ld-blog-post-${slug}-${locale}`} data={jsonLdNodes} />
      <BlogPostView
        post={post}
        homeHref={routes.home}
        blogHref={routes.blog}
        blogIndexLabel={blogIndexLabel}
      />
    </>
  );
}
