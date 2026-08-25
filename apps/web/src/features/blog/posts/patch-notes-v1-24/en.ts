import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'patch-notes-v1-24',
  locale: 'en',
  title: 'Arcadeum v1.24 - New Games, Ranked Improvements, and Replay Sharing',
  excerpt:
    'Release notes for Arcadeum v1.24: Cat Dash and Pachisi join the lineup, ranked ELO adjustments, replay sharing, and bug fixes.',
  publishedAt: '2026-08-25',
  author: 'Arcadeum team',
  tags: ['Patch Notes', 'Update', 'New Features', 'Changelog'],
  readingTimeMinutes: 5,
  body: [
    {
      type: 'paragraph',
      text: 'Arcadeum v1.24 is here. Two new games join the platform, ranked gets quality-of-life improvements, and replays are now shareable.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Highlights',
      id: 'highlights',
    },
    {
      type: 'patch-note',
      version: 'v1.24.0',
      date: '2026-08-25',
      sections: [
        {
          type: 'added',
          items: [
            'Cat Dash - multiplayer cat racing board game with dice, abilities, and track hazards',
            'Pachisi (Ludo) - classic cross-and-circle race game for 2-4 players',
            'Replay sharing - copy a link to any replay and send it to friends',
            'Replay speed controls - watch replays at 0.5x, 1x, 2x, or 4x speed',
            'Win streak badges on profile',
            'FAQ schema on all blog posts for better search visibility',
          ],
        },
        {
          type: 'changed',
          items: [
            'ELO K-factor reduced from 35 to 32 for more stable ratings at high ELO',
            'Season reset now soft-resets to 1200 (previously 1100)',
            'Landing pages now show related blog articles automatically',
            'Blog post renderer supports new block types: stat cards, replay embeds, patch notes',
            'Chess opening book updated with 2026 World Championship lines',
          ],
        },
        {
          type: 'fixed',
          items: [
            'Replay viewer no longer crashes on games with 200+ moves',
            'ELO display now updates immediately after a ranked game',
            'Fixed a bug where Hearts AI would sometimes pass when it should play',
            'Chat messages no longer overlap the game board on mobile',
            'Fixed rare case where backgammon doubling cube would reset after reconnection',
          ],
        },
        {
          type: 'removed',
          items: [
            'Deprecated practice mode for Chess (use unranked games instead)',
            'Removed legacy scoreboard that duplicated the leaderboard',
          ],
        },
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'New games',
      id: 'new-games',
    },
    {
      type: 'paragraph',
      text: 'Cat Dash and Pachisi bring the total game count to 16. Both support ranked play, multiplayer rooms, and AI opponents.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Ranked improvements',
      id: 'ranked',
    },
    {
      type: 'paragraph',
      text: 'The ELO K-factor reduction (35 to 32) means ratings move slightly slower, which reduces wild swings at high ELO. Combined with the higher season reset anchor (1200 instead of 1100), early-season games are less volatile.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'What is next',
      id: 'next',
    },
    {
      type: 'list',
      items: [
        'Tournament system - structured elimination brackets with prizes',
        'Game stats dashboard - per-game win rates, ELO history, and trend graphs',
        'Puzzle mode - tactical puzzles extracted from real ranked games',
        'Custom board themes for Chess and Checkers',
      ],
    },
    {
      type: 'cta',
      href: '/changelog',
      text: 'See the full changelog',
      description:
        'Complete list of every change, fix, and improvement in Arcadeum.',
    },
  ],
  faq: [
    {
      question: 'How do I share a replay?',
      answer:
        'Open any completed game from your history, click the Share button, and copy the link. Send it to anyone - they can watch the full game.',
    },
    {
      question: 'When does v1.24 go live?',
      answer:
        'v1.24 is live now. Cat Dash and Pachisi are available in all regions.',
    },
    {
      question: 'Will my ELO change because of the K-factor adjustment?',
      answer:
        'Your existing ELO stays the same. The K-factor change only affects how many points you gain or lose going forward.',
    },
  ],
};
