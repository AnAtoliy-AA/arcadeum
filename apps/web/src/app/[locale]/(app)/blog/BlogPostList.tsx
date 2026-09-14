import Link from 'next/link';
import type { Locale } from '@/shared/i18n';
import { Container } from '@arcadeum/ui';

export interface BlogPostCard {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTimeMinutes: number;
  href: string;
  tags: string[];
}

interface Props {
  posts: BlogPostCard[];
  locale: Locale;
}

/**
 * Server-rendered list of blog post cards. Kept separate from BlogClient
 * (which dynamically imports a heavy client view with ssr=false) so the
 * post titles, dates, and excerpts always exist in the initial HTML —
 * which is what Googlebot and the BlogPosting JSON-LD parser see first.
 */
export function BlogPostList({ posts, locale }: Props) {
  if (posts.length === 0) return null;

  return (
    <Container size="md">
      <ul className="list-none p-0 m-0 grid gap-5">
        {posts.map((post) => (
          <li
            key={post.slug}
            className="rounded-[0.875rem] bg-[var(--color-surface,rgba(255,255,255,0.04))] border border-[var(--color-border,rgba(255,255,255,0.08))] transition-[transform,border-color,background] duration-[120ms] ease hover:-translate-y-px hover:border-[rgba(64,145,220,0.4)] hover:bg-[rgba(64,145,220,0.06)]"
          >
            <Link
              href={post.href}
              className="block p-5 px-6 no-underline text-inherit rounded-[inherit]"
            >
              <h2 className="text-xl font-bold leading-[1.3] m-0 mb-2">
                {post.title}
              </h2>
              <p className="text-[0.9375rem] leading-[1.55] m-0 mb-3 text-[var(--color-text-muted,rgba(255,255,255,0.78))]">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap gap-2 text-[0.8125rem] text-[var(--color-text-muted,rgba(255,255,255,0.65))] mb-3">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span aria-hidden>·</span>
                <span>{post.readingTimeMinutes} min</span>
              </div>
              {post.tags.length > 0 && (
                <ul className="flex flex-wrap gap-[0.4rem] list-none p-0 m-0">
                  {post.tags.slice(0, 4).map((tag) => (
                    <li
                      key={tag}
                      className="text-[0.7rem] px-[0.45rem] py-[0.15rem] rounded-full bg-[var(--color-surface-2,rgba(255,255,255,0.06))] text-[var(--color-text-muted,rgba(255,255,255,0.8))] border border-[var(--color-border,rgba(255,255,255,0.08))]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
