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
import type { helpEn } from '@/shared/i18n/messages/pages/help/en';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
      ? readonly DeepPartial<U>[]
      : T[P] extends object
        ? DeepPartial<T[P]>
        : T[P];
};

export type HelpMessages = DeepPartial<typeof helpEn>;

export interface HelpPageContentProps {
  t?: HelpMessages;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'getting-started': [
    'download',
    'free',
    'invite',
    'friends',
    'play',
    'browser',
    'install',
  ],
  'games-rules': ['ai', 'opponent', 'practice', 'rules', 'difficulty'],
  'account-security': [
    'account',
    'security',
    'password',
    'privacy',
    'profile',
    'breaks',
    'help',
  ],
  'rewards-economy': ['reward', 'coins', 'streak', 'quest', 'login', 'shop'],
  'tournaments-ranking': [
    'elo',
    'rating',
    'ranking',
    'tier',
    'competitive',
    'tournament',
  ],
  'technical-support': [
    'disconnect',
    'websocket',
    'gateway',
    'network',
    'reconnect',
    'latency',
    'breaks',
  ],
};

export default function HelpPageContent({ t: initialT }: HelpPageContentProps) {
  const { messages } = useLanguage();
  const routes = useRoutes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFaqs, setExpandedFaqs] = useState<Record<number, boolean>>({
    0: true,
  });

  const help = messages.pages?.help ?? initialT;
  const status = help?.status;
  const categories = help?.categories ?? [];
  const faq = help?.faq;
  const contact = help?.contactChannels;

  const toggleFaq = (index: number) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory((prev) => {
      const next = prev === categoryId ? null : categoryId;
      if (next) {
        setExpandedFaqs({ 0: true });
        const faqEl = document.getElementById('faq');
        if (faqEl) {
          faqEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      return next;
    });
  };

  const filteredFaqItems = useMemo(() => {
    let items = faq?.items ?? [];

    if (selectedCategory && CATEGORY_KEYWORDS[selectedCategory]) {
      const keywords = CATEGORY_KEYWORDS[selectedCategory];
      const matched = items.filter((item) => {
        const text =
          `${item?.question ?? ''} ${item?.answer ?? ''}`.toLowerCase();
        return keywords.some((kw) => text.includes(kw));
      });
      if (matched.length > 0) {
        items = matched;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          Boolean(item?.question?.toLowerCase().includes(q)) ||
          Boolean(item?.answer?.toLowerCase().includes(q)),
      );
    }

    return items;
  }, [faq?.items, selectedCategory, searchQuery]);

  return (
    <PageLayout>
      <Container size="xl">
        <div className="flex flex-col gap-10 py-6">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-8 backdrop-blur-xl md:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[var(--primary)] opacity-15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[var(--accent)] opacity-10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-start gap-4 md:max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--glassBorder)] bg-[var(--glassBg)] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent,#38bdf8)]">
                🛡️ {help?.subtitle ?? 'Guides & Knowledge Base'}
              </span>
              <PageTitle size="xl" gradient>
                {help?.title ?? 'Help Center'}
              </PageTitle>
              <Typography
                variant="body"
                uiSize="lg"
                className="text-[var(--textSecondary)] leading-relaxed"
              >
                {help?.description ??
                  'Find answers to common questions, gameplay guides, and system troubleshooting.'}
              </Typography>

              <div className="relative mt-2 w-full max-w-xl">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    help?.searchPlaceholder ??
                    'Search help guides, topics, and FAQs…'
                  }
                  className="w-full rounded-2xl border border-[var(--glassBorder)] bg-[var(--background)] px-5 py-3.5 pl-12 text-sm text-[var(--color)] placeholder-[var(--textSecondary)] outline-none backdrop-blur-md transition-all duration-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                />
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[var(--textSecondary)]">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-[var(--backgroundHover)] px-2 py-0.5 text-xs text-[var(--textSecondary)] hover:text-[var(--color)]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--success)]" />
              </span>
              <Typography
                variant="label"
                uiSize="sm"
                weight="700"
                className="text-[var(--color)]"
              >
                {status?.operational ?? 'All Systems Operational'}
              </Typography>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--textSecondary)]">
              <span>{status?.gateway ?? 'WebSocket Gateway: 100% Online'}</span>
              <span>•</span>
              <span>{status?.cloud ?? 'Game Engine Cloud: Low Latency'}</span>
            </div>
          </div>

          <Section>
            <div className="flex flex-col gap-6">
              <Typography
                variant="heading"
                uiSize="xl"
                weight="800"
                className="text-[var(--color)]"
              >
                Browse by Topic
              </Typography>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => {
                  const isSelected = selectedCategory === category?.id;
                  return (
                    <div
                      key={category?.id ?? category?.title}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleCategorySelect(category?.id ?? '')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCategorySelect(category?.id ?? '');
                        }
                      }}
                      className="group w-full cursor-pointer text-left focus:outline-none"
                    >
                      <GlassCard
                        className={cx(
                          'flex h-full flex-col justify-between gap-4 p-6 transition-all duration-200 hover:-translate-y-1',
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--backgroundHover)] ring-2 ring-[var(--primary)]/30'
                            : 'hover:border-[var(--glassBorderStrong)]',
                        )}
                      >
                        <div className="flex flex-col gap-3">
                          <span className="text-3xl">{category?.icon}</span>
                          <Typography
                            variant="heading"
                            uiSize="md"
                            weight="700"
                            className="text-[var(--color)] group-hover:text-[var(--primary)] transition-colors"
                          >
                            {category?.title}
                          </Typography>
                          <Typography
                            variant="body"
                            uiSize="sm"
                            className="text-[var(--textSecondary)] leading-relaxed"
                          >
                            {category?.description}
                          </Typography>
                        </div>
                        <span className="text-xs font-bold text-[var(--primary)] group-hover:underline">
                          {isSelected
                            ? 'Selected Category ▾'
                            : 'Explore Guides →'}
                        </span>
                      </GlassCard>
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>

          <Section>
            <div className="flex flex-col gap-6" id="faq">
              <div className="flex items-center justify-between">
                <Typography
                  variant="heading"
                  uiSize="xl"
                  weight="800"
                  className="text-[var(--color)]"
                >
                  {faq?.heading ?? 'Frequently Asked Questions'}
                </Typography>
                {selectedCategory && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="cursor-pointer border-0 bg-transparent text-xs font-bold text-[var(--primary)] hover:underline"
                  >
                    Show all FAQs
                  </button>
                )}
              </div>

              {filteredFaqItems.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <Typography
                    variant="body"
                    uiSize="md"
                    className="text-[var(--textSecondary)]"
                  >
                    {selectedCategory
                      ? 'No articles found in this category.'
                      : `No help articles found matching "${searchQuery}".`}
                  </Typography>
                </GlassCard>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredFaqItems.map((item, idx) => {
                    const isOpen = expandedFaqs[idx] ?? false;
                    return (
                      <GlassCard
                        key={idx}
                        className="overflow-hidden p-0 border border-[var(--glassBorder)] bg-[var(--glassBg)]"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(idx)}
                          aria-expanded={isOpen}
                          className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-5 text-left text-[var(--color)] hover:bg-[var(--backgroundHover)] transition-colors"
                        >
                          <span className="text-base font-bold text-[var(--color)]">
                            {item?.question}
                          </span>
                          <span
                            className={cx(
                              'text-lg text-[var(--primary)] transition-transform duration-200',
                              isOpen ? 'rotate-180' : 'rotate-0',
                            )}
                          >
                            ▾
                          </span>
                        </button>
                        {isOpen && (
                          <div className="border-t border-[var(--glassBorder)] p-5 pt-3 bg-[var(--background)]">
                            <Typography
                              variant="body"
                              uiSize="sm"
                              className="text-[var(--textSecondary)] leading-relaxed"
                            >
                              {item?.answer}
                            </Typography>
                          </div>
                        )}
                      </GlassCard>
                    );
                  })}
                </div>
              )}
            </div>
          </Section>

          {contact && (
            <div className="grid grid-cols-1 gap-6 rounded-3xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-8 backdrop-blur-xl md:grid-cols-3 md:p-10">
              <div className="flex flex-col gap-2 md:col-span-1">
                <Typography
                  variant="heading"
                  uiSize="lg"
                  weight="800"
                  className="text-[var(--color)]"
                >
                  {contact.title}
                </Typography>
                <Typography
                  variant="body"
                  uiSize="sm"
                  className="text-[var(--textSecondary)] leading-relaxed"
                >
                  {contact.subtitle}
                </Typography>
              </div>

              <div className="flex flex-wrap items-center justify-start gap-4 md:col-span-2 md:justify-end">
                <Link href={routes.community}>
                  <Button variant="secondary" size="md">
                    💬 {contact.discord}
                  </Button>
                </Link>
                <Link href={routes.contact}>
                  <Button variant="primary" size="md">
                    ✉️ {contact.tickets}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
