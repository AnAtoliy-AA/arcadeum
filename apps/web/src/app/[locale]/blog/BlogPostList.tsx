import Link from 'next/link';
import type { Locale } from '@/shared/i18n';
import { Container } from '@/shared/ui';
import styles from './BlogPostList.module.scss';

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
 * (which dynamically imports a Tamagui-heavy view with ssr=false) so the
 * post titles, dates, and excerpts always exist in the initial HTML —
 * which is what Googlebot and the BlogPosting JSON-LD parser see first.
 */
export function BlogPostList({ posts, locale }: Props) {
  if (posts.length === 0) return null;

  return (
    <Container size="md">
      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.slug} className={styles.card}>
            <Link href={post.href} className={styles.cardLink}>
              <h2 className={styles.cardTitle}>{post.title}</h2>
              <p className={styles.cardExcerpt}>{post.excerpt}</p>
              <div className={styles.cardMeta}>
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
                <ul className={styles.tags}>
                  {post.tags.slice(0, 4).map((tag) => (
                    <li key={tag}>{tag}</li>
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
