import { describe, it, expect } from 'vitest';
import { SUPPORTED_LOCALES } from '@/shared/i18n';
import { getPost, getPosts, getPostsByTag, POST_SLUGS } from '../registry';

describe('blog registry', () => {
  it('registers all canonical post slugs', () => {
    expect(POST_SLUGS.length).toBeGreaterThanOrEqual(22);
    expect(POST_SLUGS).toContain('how-to-play-spades');
    expect(POST_SLUGS).toContain('how-to-play-go');
    expect(POST_SLUGS).toContain('how-to-win-tic-tac-toe');
    expect(POST_SLUGS).toContain('how-to-play-chess');
  });

  it('provides complete 5-locale coverage for Spades guide', async () => {
    for (const locale of SUPPORTED_LOCALES) {
      const post = await getPost('how-to-play-spades', locale);
      expect(post).toBeDefined();
      expect(post?.locale).toBe(locale);
      expect(post?.title.length).toBeGreaterThan(10);
      expect(post?.excerpt.length).toBeGreaterThan(20);
      expect(post?.body.length).toBeGreaterThan(5);
      expect(post?.howTo?.steps.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('provides complete 5-locale coverage for Go guide', async () => {
    for (const locale of SUPPORTED_LOCALES) {
      const post = await getPost('how-to-play-go', locale);
      expect(post).toBeDefined();
      expect(post?.locale).toBe(locale);
      expect(post?.title.length).toBeGreaterThan(10);
      expect(post?.body.length).toBeGreaterThan(5);
    }
  });

  it('provides complete 5-locale coverage for Tic-Tac-Toe guide', async () => {
    for (const locale of SUPPORTED_LOCALES) {
      const post = await getPost('how-to-win-tic-tac-toe', locale);
      expect(post).toBeDefined();
      expect(post?.locale).toBe(locale);
      expect(post?.title.length).toBeGreaterThan(10);
      expect(post?.body.length).toBeGreaterThan(5);
    }
  });

  it('sorts posts by publication date descending in getPosts', async () => {
    const posts = await getPosts('en');
    expect(posts.length).toBe(POST_SLUGS.length);
    for (let i = 0; i < posts.length - 1; i++) {
      const current = new Date(posts[i].publishedAt).getTime();
      const next = new Date(posts[i + 1].publishedAt).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it('filters posts by tag accurately with getPostsByTag', async () => {
    const strategyPosts = await getPostsByTag('en', ['Strategy'], 10);
    expect(strategyPosts.length).toBeGreaterThan(0);
    for (const post of strategyPosts) {
      const lowerTags = post.tags.map((t) => t.toLowerCase());
      expect(lowerTags).toContain('strategy');
    }

    const emptyResult = await getPostsByTag('en', ['nonexistent-tag-xyz'], 5);
    expect(emptyResult).toEqual([]);
  });

  it('ensures every registered post has valid structural metadata', async () => {
    for (const slug of POST_SLUGS) {
      const post = await getPost(slug, 'en');
      expect(post).toBeDefined();
      expect(post?.slug).toBe(slug);
      expect(post?.author).toBeTruthy();
      expect(post?.readingTimeMinutes).toBeGreaterThan(0);
      expect(post?.tags.length).toBeGreaterThan(0);
      expect(post?.body.length).toBeGreaterThan(0);
    }
  });

  it('provides complete 5-locale coverage and CTAs for all 9 pillar strategy guides', async () => {
    const pillarSlugs = [
      'chess-opening-traps',
      'how-to-win-chess-endgames',
      'how-to-win-spades',
      'how-to-win-hearts-advanced',
      'backgammon-pip-count-guide',
      'how-to-win-checkers',
      'how-to-solve-sudoku-advanced',
      'sea-battle-advanced',
      'go-life-death-problems',
    ];

    for (const slug of pillarSlugs) {
      for (const locale of SUPPORTED_LOCALES) {
        const post = await getPost(slug, locale);
        expect(post).toBeDefined();
        expect(post?.locale).toBe(locale);
        expect(post?.title.length).toBeGreaterThan(5);
        expect(post?.excerpt.length).toBeGreaterThan(10);
        expect(post?.body.length).toBeGreaterThan(2);

        const hasCta = post?.body.some((b) => b.type === 'cta');
        expect(hasCta).toBe(true);
      }
    }
  });

  it('surfaces strategy guides for Chess and Spades tags', async () => {
    const chessPosts = await getPostsByTag('en', ['Chess']);
    expect(chessPosts.length).toBeGreaterThanOrEqual(2);
    const chessSlugs = chessPosts.map((p) => p.slug);
    expect(chessSlugs).toContain('chess-opening-traps');
    expect(chessSlugs).toContain('how-to-win-chess-endgames');

    const spadesPosts = await getPostsByTag('en', ['Spades']);
    expect(spadesPosts.length).toBeGreaterThanOrEqual(1);
    const spadesSlugs = spadesPosts.map((p) => p.slug);
    expect(spadesSlugs).toContain('how-to-win-spades');
  });
});
