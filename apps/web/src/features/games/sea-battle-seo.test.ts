import { describe, it, expect } from 'vitest';
import { getPost, POST_SLUGS } from '@/features/blog/registry';
import { SUPPORTED_LOCALES, type Locale } from '@/shared/i18n';
import { loadMessages } from '@/shared/i18n/messages';

describe('Sea Battle SEO & Rich Snippets', () => {
  it('registers the new strategic placement blog guide across all locales', () => {
    expect(POST_SLUGS).toContain('sea-battle-best-strategies-and-placements');

    for (const locale of SUPPORTED_LOCALES) {
      const post = getPost(
        'sea-battle-best-strategies-and-placements',
        locale as Locale,
      );
      expect(post).toBeDefined();
      expect(post?.title).toBeTruthy();
      expect(post?.excerpt).toBeTruthy();
      expect(post?.body.length).toBeGreaterThan(3);
      expect(post?.tags.length).toBeGreaterThan(2);
      expect(post?.faq?.length).toBeGreaterThan(1);
    }
  });

  it('has enriched landing metadata and target keywords in all locales', async () => {
    for (const locale of SUPPORTED_LOCALES) {
      const messages = await loadMessages(locale as Locale);
      const landing = messages.games?.sea_battle_v1?.landing;
      expect(landing).toBeDefined();
      expect(landing?.meta?.title).toBeTruthy();
      expect(landing?.meta?.description).toBeTruthy();
      expect(landing?.meta?.keywords).toBeTruthy();
      expect(landing?.faq?.items).toBeDefined();

      const faqKeys = Object.keys(landing?.faq?.items ?? {});
      expect(faqKeys).toContain('free');
      expect(faqKeys).toContain('players');
      expect(faqKeys).toContain('friends');
      expect(faqKeys).toContain('shipsCount');
      expect(faqKeys).toContain('bestPlacement');
    }
  });
});
