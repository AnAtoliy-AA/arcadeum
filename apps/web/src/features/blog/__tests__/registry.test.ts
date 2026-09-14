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

  it('provides complete 5-locale coverage for Spades guide', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const post = getPost('how-to-play-spades', locale);
      expect(post).toBeDefined();
      expect(post?.locale).toBe(locale);
      expect(post?.title.length).toBeGreaterThan(10);
      expect(post?.excerpt.length).toBeGreaterThan(20);
      expect(post?.body.length).toBeGreaterThan(5);
      expect(post?.howTo?.steps.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('provides complete 5-locale coverage for Go guide', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const post = getPost('how-to-play-go', locale);
      expect(post).toBeDefined();
      expect(post?.locale).toBe(locale);
      expect(post?.title.length).toBeGreaterThan(10);
      expect(post?.body.length).toBeGreaterThan(5);
    }
  });

  it('provides complete 5-locale coverage for Tic-Tac-Toe guide', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const post = getPost('how-to-win-tic-tac-toe', locale);
      expect(post).toBeDefined();
      expect(post?.locale).toBe(locale);
      expect(post?.title.length).toBeGreaterThan(10);
      expect(post?.body.length).toBeGreaterThan(5);
    }
  });

  it('sorts posts by publication date descending in getPosts', () => {
    const posts = getPosts('en');
    expect(posts.length).toBe(POST_SLUGS.length);
    for (let i = 0; i < posts.length - 1; i++) {
      const current = new Date(posts[i].publishedAt).getTime();
      const next = new Date(posts[i + 1].publishedAt).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it('filters posts by tag accurately with getPostsByTag', () => {
    const strategyPosts = getPostsByTag('en', ['Strategy'], 10);
    expect(strategyPosts.length).toBeGreaterThan(0);
    for (const post of strategyPosts) {
      const lowerTags = post.tags.map((t) => t.toLowerCase());
      expect(lowerTags).toContain('strategy');
    }

    const emptyResult = getPostsByTag('en', ['nonexistent-tag-xyz'], 5);
    expect(emptyResult).toEqual([]);
  });

  it('ensures every registered post has valid structural metadata', () => {
    for (const slug of POST_SLUGS) {
      const post = getPost(slug, 'en');
      expect(post).toBeDefined();
      expect(post?.slug).toBe(slug);
      expect(post?.author).toBeTruthy();
      expect(post?.readingTimeMinutes).toBeGreaterThan(0);
      expect(post?.tags.length).toBeGreaterThan(0);
      expect(post?.body.length).toBeGreaterThan(0);
    }
  });
});
