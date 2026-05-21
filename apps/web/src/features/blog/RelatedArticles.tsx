import Link from 'next/link';
import { buildRoutes } from '@/shared/config/routes';
import type { Locale } from '@/shared/i18n';
import type { BlogPost } from './types';
import { BLOG_LABELS } from './labels';
import styles from './RelatedArticles.module.css';

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
      className={styles.section}
      aria-labelledby="related-articles-heading"
    >
      <span className={styles.kicker}>{labels.relatedKicker}</span>
      <h2 id="related-articles-heading" className={styles.title}>
        {title}
      </h2>
      <ul className={styles.list}>
        {posts.map((post) => {
          const routes = buildRoutes(locale);
          return (
            <li key={post.slug} className={styles.card}>
              <Link
                href={routes.blogPost(post.slug)}
                className={styles.cardLink}
              >
                <h3 className={styles.cardTitle}>{post.title}</h3>
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
