'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  Typography,
  Section,
  Button,
} from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import { useRoutes } from '@/shared/config/useRoutes';
import { cx } from '@arcadeum/ui/utils/cx';
import type { Locale } from '@/shared/i18n';
import type { blogEn } from '@/shared/i18n/messages/pages/blog/en';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
      ? readonly DeepPartial<U>[]
      : T[P] extends object
        ? DeepPartial<T[P]>
        : T[P];
};

export type BlogMessages = DeepPartial<typeof blogEn>;

export interface BlogPostItem {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTimeMinutes: number;
  href: string;
  tags: string[];
}

export interface BlogPageContentProps {
  t?: BlogMessages;
  posts?: BlogPostItem[];
  locale?: Locale;
}

export default function BlogPageContent({
  t: initialT,
  posts = [],
  locale = 'en',
}: BlogPageContentProps) {
  const { messages } = useLanguage();
  const routes = useRoutes();
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const blog = messages.pages?.blog ?? initialT;
  const newsletter = blog?.newsletter;
  const cta = blog?.cta;

  const categories = useMemo(() => {
    return [
      { id: 'all', label: blog?.categories?.all ?? 'All' },
      { id: 'guide', label: blog?.categories?.guides ?? 'Guides' },
      { id: 'updates', label: blog?.categories?.updates ?? 'Updates' },
      { id: 'strategy', label: 'Strategy' },
      { id: 'community', label: blog?.categories?.community ?? 'Community' },
    ];
  }, [blog?.categories]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesTag =
        selectedTag === 'all' ||
        post.tags.some(
          (tag) => tag.toLowerCase() === selectedTag.toLowerCase(),
        );

      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  const featuredPost = posts[0];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <PageLayout>
      <Container size="xl">
        <div className="flex flex-col gap-10 py-6">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-8 backdrop-blur-xl md:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[var(--primary)] opacity-15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[var(--gold)] opacity-10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-start gap-4 md:max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--glassBorder)] bg-[var(--glassBg)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                📰 {blog?.subtitle ?? 'Guides, Updates & Stories'}
              </span>
              <PageTitle size="xl" gradient>
                {blog?.title ?? 'Arcadeum Gaming Blog'}
              </PageTitle>
              <Typography variant="body" uiSize="lg" alpha="high">
                {blog?.description ??
                  'Deep dives into game mechanics, balance changes, and pro gameplay strategies.'}
              </Typography>

              <div className="relative mt-2 w-full max-w-xl">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    blog?.searchPlaceholder ?? 'Search articles and guides…'
                  }
                  className="w-full rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] px-5 py-3.5 pl-12 text-sm text-[var(--color)] placeholder-[var(--colorMuted)] outline-none backdrop-blur-md transition-all duration-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                />
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[var(--colorMuted)]">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-[var(--colorMuted)] hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedTag(cat.id)}
                className={cx(
                  'cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200',
                  selectedTag === cat.id
                    ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm'
                    : 'border-[var(--glassBorder)] bg-[var(--glassBg)] text-[var(--colorMuted)] hover:border-[var(--primary)] hover:text-white',
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {featuredPost && selectedTag === 'all' && !searchQuery && (
            <Section>
              <div className="flex flex-col gap-4">
                <Link
                  href={featuredPost.href}
                  className="group block no-underline"
                >
                  <div className="relative overflow-hidden rounded-3xl border border-[var(--primary)]/40 bg-[var(--glassBg)] p-8 backdrop-blur-xl transition-all duration-300 hover:border-[var(--primary)] hover:shadow-2xl md:p-10">
                    <div className="flex flex-col items-start gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold text-white">
                          {blog?.featuredBadge ?? 'Featured Article'}
                        </span>
                        <span className="text-xs text-[var(--colorMuted)]">
                          {new Date(
                            featuredPost.publishedAt,
                          ).toLocaleDateString(locale, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-xs text-[var(--colorMuted)]">
                          • {featuredPost.readingTimeMinutes} min read
                        </span>
                      </div>

                      <Typography
                        variant="heading"
                        uiSize="xl"
                        weight="800"
                        className="transition-colors group-hover:text-[var(--primary)]"
                      >
                        {featuredPost.title}
                      </Typography>

                      <Typography variant="body" uiSize="md" alpha="high">
                        {featuredPost.excerpt}
                      </Typography>

                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {featuredPost.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-medium text-[var(--colorMuted)]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </Section>
          )}

          <Section>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <Typography variant="heading" uiSize="xl" weight="800">
                  Latest Articles
                </Typography>
                <span className="text-xs text-[var(--colorMuted)]">
                  {filteredPosts.length} article
                  {filteredPosts.length === 1 ? '' : 's'}
                </span>
              </div>

              {filteredPosts.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <Typography variant="body" uiSize="md" alpha="medium">
                    No articles found matching your query.
                  </Typography>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={post.href}
                      className="group block no-underline"
                    >
                      <GlassCard className="flex h-full flex-col justify-between gap-4 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-xl">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between text-xs text-[var(--colorMuted)]">
                            <time dateTime={post.publishedAt}>
                              {new Date(post.publishedAt).toLocaleDateString(
                                locale,
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                },
                              )}
                            </time>
                            <span>{post.readingTimeMinutes} min</span>
                          </div>

                          <Typography
                            variant="heading"
                            uiSize="md"
                            weight="700"
                            className="transition-colors group-hover:text-[var(--primary)]"
                          >
                            {post.title}
                          </Typography>

                          <Typography
                            variant="body"
                            uiSize="sm"
                            alpha="medium"
                            className="line-clamp-3 leading-relaxed"
                          >
                            {post.excerpt}
                          </Typography>
                        </div>

                        <div className="flex flex-wrap gap-1.5 border-t border-[var(--borderColor)] pt-3">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-[var(--colorMuted)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </GlassCard>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {newsletter && (
            <div className="relative overflow-hidden rounded-3xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-8 backdrop-blur-xl md:p-10">
              <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div className="flex max-w-xl flex-col gap-2">
                  <Typography variant="heading" uiSize="lg" weight="800">
                    {newsletter.title}
                  </Typography>
                  <Typography variant="body" uiSize="sm" alpha="medium">
                    {newsletter.subtitle}
                  </Typography>
                </div>

                {subscribed ? (
                  <span className="rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 px-5 py-3 text-sm font-bold text-[var(--success)]">
                    ✓ {newsletter.success}
                  </span>
                ) : (
                  <form
                    onSubmit={handleSubscribe}
                    className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={newsletter.placeholder}
                      className="rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] px-4 py-2.5 text-sm text-[var(--color)] placeholder-[var(--colorMuted)] outline-none focus:border-[var(--primary)]"
                    />
                    <Button type="submit" variant="primary" size="md">
                      {newsletter.button}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}

          {cta && (
            <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-8 text-center backdrop-blur-xl md:flex-row md:p-10 md:text-left">
              <div className="flex max-w-xl flex-col gap-2">
                <Typography variant="heading" uiSize="lg" weight="800">
                  {cta.title}
                </Typography>
                <Typography variant="body" uiSize="sm" alpha="medium">
                  {cta.description}
                </Typography>
              </div>
              <Link href={routes.community}>
                <Button variant="secondary" size="md">
                  ✍️ {cta.button}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
