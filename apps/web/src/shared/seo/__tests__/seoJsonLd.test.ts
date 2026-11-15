import { describe, it, expect } from 'vitest';
import { buildVideoGameJsonLd } from '../videoGameJsonLd';
import { buildFaqPageJsonLd } from '../faqPageJsonLd';
import { buildGameLandingJsonLd } from '../buildGameLandingJsonLd';
import { buildBlogPostJsonLd } from '../blogPostJsonLd';

describe('SEO JSON-LD builders', () => {
  it('builds comprehensive VideoGame schema with features and platforms', () => {
    const jsonLd = buildVideoGameJsonLd({
      gameId: 'chess_v1',
      gameName: 'Chess',
      description: 'The classic strategy board game',
      locale: 'en',
      minPlayers: 2,
      maxPlayers: 2,
      genre: 'Board Game',
      alternateName: ['Chess Online'],
      featureList: ['Stockfish 19', 'Chess960'],
      breadcrumb: {
        home: 'Home',
        games: 'Games',
        game: 'Chess',
      },
    });

    expect(jsonLd).toHaveLength(3);
    const videoGame = jsonLd[0];
    expect(videoGame['@type']).toBe('VideoGame');
    expect(videoGame['name']).toBe('Chess');
    expect(videoGame['aggregateRating']).toBeDefined();
    expect(videoGame['gamePlatform']).toEqual([
      'Web Browser',
      'Desktop',
      'Mobile',
    ]);
    expect(videoGame['featureList']).toEqual(['Stockfish 19', 'Chess960']);

    const softwareApp = jsonLd[1];
    expect(softwareApp['@type']).toBe('SoftwareApplication');
    expect(softwareApp['aggregateRating']).toBeDefined();

    const breadcrumbs = jsonLd[2];
    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
  });

  it('builds FAQPage schema with questions and accepted answers', () => {
    const faqLd = buildFaqPageJsonLd({
      pageName: 'Chess',
      pageUrl: '/en/games/chess',
      faqs: [
        {
          question: 'Is Chess free?',
          answer: 'Yes, 100% free with no install or signup.',
        },
      ],
    });

    expect(faqLd).toHaveLength(2);
    const faqPage = faqLd[0];
    expect(faqPage['@type']).toBe('FAQPage');
    const mainEntity = faqPage['mainEntity'] as Array<Record<string, unknown>>;
    expect(mainEntity).toHaveLength(1);
    expect(mainEntity[0]['@type']).toBe('Question');
    expect(mainEntity[0]['name']).toBe('Is Chess free?');
  });

  it('builds full landing schemas with VideoGame, SoftwareApplication, HowTo, and FAQPage', () => {
    const schemas = buildGameLandingJsonLd({
      gameId: 'backgammon_v1',
      slug: 'backgammon',
      gameName: 'Backgammon',
      description: 'Classic backgammon game',
      locale: 'en',
      breadcrumb: {
        home: 'Home',
        games: 'Games',
      },
      howTo: {
        name: 'How to Play Backgammon',
        description: 'Guide',
        steps: [{ name: 'Roll dice', text: 'Move checkers according to roll' }],
      },
      faqs: [{ question: 'Is Backgammon free?', answer: 'Yes, 100% free' }],
    });

    const types = schemas.map((s) => s['@type']);
    expect(types).toContain('VideoGame');
    expect(types).toContain('SoftwareApplication');
    expect(types).toContain('BreadcrumbList');
    expect(types).toContain('HowTo');
    expect(types).toContain('FAQPage');

    const breadcrumbs = schemas.filter((s) => s['@type'] === 'BreadcrumbList');
    expect(breadcrumbs).toHaveLength(1);

    const videoGame = schemas.find((s) => s['@type'] === 'VideoGame');
    expect(videoGame?.['url']).toContain('/en/games/backgammon');
    expect(videoGame?.['url']).not.toContain('backgammon_v1');
    expect(videoGame?.['@id']).toContain('/en/games/backgammon#game');
    expect(videoGame?.['inLanguage']).toBe('en-US');
  });

  it('builds BlogPosting schema with @id, localized language, and dynamic image', () => {
    const postLd = buildBlogPostJsonLd({
      locale: 'en',
      pageUrl: '/en/blog/how-to-win-spades',
      title: 'How to Win at Spades',
      excerpt: 'Master bids, bags, and nil play.',
      publishedAt: '2026-09-18',
      author: 'Arcadeum Team',
      tags: ['Spades', 'Card Game', 'Strategy'],
      readingTimeMinutes: 8,
      wordCount: 1650,
    });

    expect(postLd['@type']).toBe('BlogPosting');
    expect(postLd['@id']).toContain('/en/blog/how-to-win-spades#article');
    expect(postLd['headline']).toBe('How to Win at Spades');
    expect(postLd['inLanguage']).toBe('en-US');
    expect(postLd['image']).toContain(
      '/en/blog/how-to-win-spades/opengraph-image',
    );
    expect(postLd['wordCount']).toBe(1650);
  });
});
