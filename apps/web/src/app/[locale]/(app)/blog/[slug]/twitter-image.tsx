import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgCard,
} from '@/shared/seo/ogImageTemplate';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getPost } from '@/features/blog/registry';
import { BLOG_LABELS } from '@/features/blog/labels';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Arcadeum blog';

type Props = { params: Promise<{ locale: string; slug: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export default async function BlogPostTwitterImage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const post = getPost(slug, locale);

  if (!post) {
    return renderOgCard({
      kicker: 'Arcadeum blog',
      title: 'Read more',
      accent: '#4091dc',
    });
  }

  const labels = BLOG_LABELS[locale];
  const date = new Date(post.publishedAt).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return renderOgCard({
    kicker: 'Arcadeum blog',
    title: post.title,
    subtitle: post.excerpt,
    footer: `${date}  ·  ${post.readingTimeMinutes} ${labels.minRead}`,
    accent: '#4091dc',
    gradient: ['#0c1729', '#03091a'],
  });
}
