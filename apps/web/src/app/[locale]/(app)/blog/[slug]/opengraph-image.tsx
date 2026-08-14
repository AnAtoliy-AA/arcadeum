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

function BlogVisual() {
  return (
    <div
      style={{
        position: 'relative',
        width: 380,
        height: 380,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Article lines visual */}
      <div
        style={{
          position: 'absolute',
          width: 280,
          height: 320,
          borderRadius: 18,
          background: 'rgba(64, 145, 220, 0.08)',
          border: '1px solid rgba(64, 145, 220, 0.15)',
        }}
      />

      {/* Decorative lines representing text */}
      {[
        { y: 60, w: 220, h: 12, r: 6 },
        { y: 90, w: 180, h: 10, r: 5 },
        { y: 115, w: 200, h: 10, r: 5 },
        { y: 140, w: 160, h: 10, r: 5 },
        { y: 170, w: 210, h: 10, r: 5 },
        { y: 195, w: 140, h: 10, r: 5 },
        { y: 225, w: 190, h: 10, r: 5 },
        { y: 250, w: 170, h: 10, r: 5 },
      ].map((line, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 50,
            top: line.y,
            width: line.w,
            height: line.h,
            borderRadius: line.r,
            background:
              i === 0
                ? 'rgba(64, 145, 220, 0.45)'
                : `rgba(64, 145, 220, ${0.15 + (i % 3) * 0.05})`,
          }}
        />
      ))}

      {/* Accent dot */}
      <div
        style={{
          position: 'absolute',
          right: 30,
          top: 50,
          width: 28,
          height: 28,
          borderRadius: 14,
          background: '#4091dc',
          boxShadow: '0 0 20px rgba(64, 145, 220, 0.6)',
        }}
      />
    </div>
  );
}

export default async function BlogPostOpengraphImage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const post = getPost(slug, locale);

  if (!post) {
    return renderOgCard({
      kicker: 'Arcadeum blog',
      title: 'Read more',
      accent: '#4091dc',
      children: <BlogVisual />,
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
    children: <BlogVisual />,
  });
}
