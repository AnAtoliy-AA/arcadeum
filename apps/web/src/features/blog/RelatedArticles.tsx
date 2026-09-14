import Link from 'next/link';
import { buildRoutes } from '@/shared/config/routes';
import type { Locale } from '@/shared/i18n';
import type { BlogPost } from './types';
import { BLOG_LABELS } from './labels';

interface Props {
  locale: Locale;
  posts: BlogPost[];
  /**
   * Optional localized game name. When supplied the section heading is
   * specialized ("Guides & strategy for Sea Battle") which reads more
   * naturally than a generic "Related guides" block and surfaces the
   * game name in the HTML for an extra on-page keyword signal.
   */
  gameName?: string;
}

/**
 * Server-rendered "Related articles" block. Surfaces blog posts that
 * match the host page's topic (e.g. Sea Battle landing → sea-battle
 * how-to article). Always server-rendered so the internal links land
 * in the initial HTML and feed PageRank to the linked posts.
 */
export function RelatedArticles({ locale, posts, gameName }: Props) {
  if (posts.length === 0) return null;

  const labels = BLOG_LABELS[locale];
  const title = gameName
    ? labels.relatedTitleForGame.replace('{{game}}', gameName)
    : labels.relatedTitle;

  return (
    <section
      className="py-10 border-t border-[var(--color-border,rgba(255,255,255,0.08))]"
      aria-labelledby="related-articles-heading"
    >
      <span className="inline-block text-xs uppercase tracking-[0.12em] font-semibold text-[var(--color-text-muted,rgba(255,255,255,0.6))] mb-2">
        {labels.relatedKicker}
      </span>
      <h2
        id="related-articles-heading"
        className="text-[clamp(1.5rem,3vw,2rem)] font-bold m-0 mb-5"
      >
        {title}
      </h2>
      <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {posts.map((post) => {
          const routes = buildRoutes(locale);
          return (
            <li
              key={post.slug}
              className="rounded-[0.875rem] bg-[var(--color-surface,rgba(255,255,255,0.04))] border border-[var(--color-border,rgba(255,255,255,0.08))] transition-[transform,border-color,background] duration-[120ms] ease hover:-translate-y-px hover:border-[rgba(64,145,220,0.4)] hover:bg-[rgba(64,145,220,0.06)]"
            >
              <Link
                href={routes.blogPost(post.slug)}
                className="block p-[1.1rem_1.25rem] no-underline text-inherit rounded-[inherit]"
              >
                <h3 className="text-[1.0625rem] font-bold leading-[1.3] m-0 mb-1">
                  {post.title}
                </h3>
                <p className="text-sm leading-[1.55] m-0 mb-[0.65rem] text-[var(--color-text-muted,rgba(255,255,255,0.78))] line-clamp-3 overflow-hidden">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-1 text-xs text-[var(--color-text-muted,rgba(255,255,255,0.65))]">
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span aria-hidden>·</span>
                  <span>
                    {post.readingTimeMinutes} {labels.minRead}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
