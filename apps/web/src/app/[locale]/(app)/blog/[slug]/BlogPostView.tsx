import Link from 'next/link';
import { Container, PageLayout } from '@arcadeum/ui';
import type { BlogPost } from '@/features/blog/types';
import styles from './BlogPost.module.scss';

interface Props {
  post: BlogPost;
  homeHref: string;
  blogHref: string;
  blogIndexLabel: string;
}

export function BlogPostView({
  post,
  homeHref,
  blogHref,
  blogIndexLabel,
}: Props) {
  return (
    <PageLayout>
      <Container size="md">
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <ol>
            <li>
              <Link href={homeHref}>Home</Link>
            </li>
            <li>
              <Link href={blogHref}>{blogIndexLabel}</Link>
            </li>
            <li aria-current="page">{post.title}</li>
          </ol>
        </nav>

        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.title}>{post.title}</h1>
            <p className={styles.excerpt}>{post.excerpt}</p>
            <div className={styles.meta}>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString(post.locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span aria-hidden>·</span>
              <span>{post.readingTimeMinutes} min</span>
              <span aria-hidden>·</span>
              <span>{post.author}</span>
            </div>
            {post.tags.length > 0 && (
              <ul className={styles.tags}>
                {post.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </header>

          <div className={styles.body}>
            {post.body.map((block, index) => {
              switch (block.type) {
                case 'heading': {
                  if (block.level === 2) {
                    return (
                      <h2 key={index} id={block.id} className={styles.heading2}>
                        {block.text}
                      </h2>
                    );
                  }
                  return (
                    <h3 key={index} id={block.id} className={styles.heading3}>
                      {block.text}
                    </h3>
                  );
                }
                case 'paragraph':
                  return (
                    <p key={index} className={styles.paragraph}>
                      {block.text}
                    </p>
                  );
                case 'list':
                  return (
                    <ul key={index} className={styles.list}>
                      {block.items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  );
                case 'cta':
                  return (
                    <aside key={index} className={styles.cta}>
                      <Link href={block.href} className={styles.ctaLink}>
                        <strong className={styles.ctaText}>{block.text}</strong>
                        {block.description && (
                          <span className={styles.ctaDescription}>
                            {block.description}
                          </span>
                        )}
                        <span className={styles.ctaArrow} aria-hidden>
                          →
                        </span>
                      </Link>
                    </aside>
                  );
                case 'stat-card':
                  return (
                    <div key={index} className={styles.statCard}>
                      <h3 className={styles.statCardTitle}>{block.title}</h3>
                      <div className={styles.statGrid}>
                        {block.stats.map((stat, statIndex) => (
                          <div key={statIndex} className={styles.statItem}>
                            <span className={styles.statValue}>
                              {stat.value}
                            </span>
                            <span className={styles.statLabel}>
                              {stat.label}
                            </span>
                            {stat.description && (
                              <span className={styles.statDescription}>
                                {stat.description}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                case 'replay-embed':
                  return (
                    <div key={index} className={styles.replayEmbed}>
                      <Link
                        href={`/replay/${block.replayId}`}
                        className={styles.replayLink}
                      >
                        <span className={styles.replayIcon} aria-hidden>
                          ▶
                        </span>
                        <div>
                          <strong className={styles.replayTitle}>
                            {block.title}
                          </strong>
                          {block.description && (
                            <span className={styles.replayDescription}>
                              {block.description}
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                  );
                case 'patch-note':
                  return (
                    <div key={index} className={styles.patchNote}>
                      <div className={styles.patchHeader}>
                        <span className={styles.patchVersion}>
                          {block.version}
                        </span>
                        <time
                          className={styles.patchDate}
                          dateTime={block.date}
                        >
                          {new Date(block.date).toLocaleDateString(
                            post.locale,
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </time>
                      </div>
                      {block.sections.map((section, sIndex) => (
                        <div key={sIndex} className={styles.patchSection}>
                          <span
                            className={`${styles.patchBadge} ${styles[section.type]}`}
                          >
                            {section.type}
                          </span>
                          <ul className={styles.patchList}>
                            {section.items.map((item, iIndex) => (
                              <li key={iIndex}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>

          {post.faq && post.faq.length > 0 && (
            <section className={styles.faq} aria-labelledby="faq-heading">
              <h2 id="faq-heading" className={styles.heading2}>
                Frequently Asked Questions
              </h2>
              <dl>
                {post.faq.map((item, index) => (
                  <div key={index} className={styles.faqItem}>
                    <dt className={styles.faqQuestion}>{item.question}</dt>
                    <dd className={styles.faqAnswer}>{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </article>
      </Container>
    </PageLayout>
  );
}
