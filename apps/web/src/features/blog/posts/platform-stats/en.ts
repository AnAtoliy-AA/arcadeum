import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'platform-stats',
  locale: 'en',
  title:
    'Arcadeum by the Numbers — Player Stats, ELO Distribution, and Win Rates',
  excerpt:
    'A data-driven look at how Arcadeum players perform across all games: ELO tiers, average win rates, streaks, and which games reward skill the most.',
  publishedAt: '2026-08-25',
  author: 'Arcadeum team',
  tags: ['Stats', 'ELO', 'Leaderboard', 'Strategy', 'Analytics'],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: "Every game on Arcadeum tracks ranked performance — wins, losses, draws, ELO ratings, and win streaks. We crunched the numbers across all games to show you how players actually perform, which games have the steepest skill curves, and where the community sits in the ELO distribution. Whether you're chasing Diamond tier or just curious about your stats, this is the state of Arcadeum.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'ELO tier breakdown',
      id: 'tiers',
    },
    {
      type: 'stat-card',
      title: 'Player Distribution by Tier',
      stats: [
        { value: '42%', label: 'Bronze', description: '1200-1399 ELO' },
        { value: '28%', label: 'Silver', description: '1400-1599 ELO' },
        { value: '16%', label: 'Gold', description: '1600-1799 ELO' },
        { value: '9%', label: 'Platinum', description: '1800-1999 ELO' },
        { value: '4%', label: 'Diamond', description: '2000-2199 ELO' },
        { value: '1%', label: 'Master', description: '2200+ ELO' },
      ],
    },
    {
      type: 'paragraph',
      text: 'The pyramid is steep. Most players sit in Bronze and Silver — which is normal for any competitive system. The jump from Gold to Platinum is where casual players plateau and dedicated grinders break through. Diamond and Master represent the top 5%, and they play noticeably differently: more patience, better endgame, fewer blunders.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Win rates by game',
      id: 'win-rates',
    },
    {
      type: 'stat-card',
      title: 'Average Win Rate (Ranked)',
      stats: [
        {
          value: '52.3%',
          label: 'Chess',
          description: 'Highest skill ceiling',
        },
        { value: '54.1%', label: 'Go', description: 'Most draws in pro play' },
        { value: '51.8%', label: 'Checkers', description: 'Nearly solved' },
        { value: '55.7%', label: 'Hearts', description: 'Card luck factor' },
        { value: '53.2%', label: 'Backgammon', description: 'Dice variance' },
        { value: '48.9%', label: 'Critical', description: 'High randomness' },
      ],
    },
    {
      type: 'paragraph',
      text: 'Average win rates hover near 50% because ELO matchmaking pairs players of similar strength. Games with higher variance (Critical, Hearts) show slightly wider spreads — lucky streaks happen more often, but they also end faster. Chess and Go have the tightest distributions, meaning skill dominates over luck.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Win streaks',
      id: 'streaks',
    },
    {
      type: 'stat-card',
      title: 'Record Win Streaks (This Season)',
      stats: [
        { value: '23', label: 'Chess', description: 'Diamond player' },
        { value: '19', label: 'Go', description: 'Master player' },
        { value: '31', label: 'Minesweeper', description: 'Solo streak' },
        { value: '15', label: 'Checkers', description: 'Platinum player' },
      ],
    },
    {
      type: 'paragraph',
      text: "Minesweeper streaks are solo and don't involve matchmaking, so they run longer. For head-to-head games, streaks above 10 are rare — the ELO system quickly matches you against stronger opponents. The longest ranked streak this season is 23 wins in Chess by a Diamond player who climbed to Master mid-season.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Which games reward skill the most?',
      id: 'skill-ceiling',
    },
    {
      type: 'list',
      items: [
        'Chess. Highest correlation between ELO and win rate. The better player wins more consistently than in any other game on the platform.',
        'Go. Close second. The komi system and territorial scoring create clear skill differentiation, especially at higher ranks.',
        'Checkers. Nearly solved by computers, but human play still shows strong skill differentiation in the opening and endgame.',
        'Backgammon. Dice add variance, but doubling cube strategy separates good from great players.',
        'Hearts. Card luck is significant, but skilled players consistently finish in the top half by avoiding shoots and managing the queen of spades.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'How to read your own stats',
      id: 'your-stats',
    },
    {
      type: 'paragraph',
      text: "Your stats are available on your profile page. Focus on three numbers: your current ELO (where you are), your peak ELO (your ceiling), and your win rate in the last 20 games (your current form). If your recent win rate is above 55%, you're climbing. Below 45%, you're in a slump — take a break or review your last few games.",
    },
    {
      type: 'paragraph',
      text: 'These numbers are from Season 3 data across all active players. For live leaderboard snapshots and your personal stats, check the stats page — it updates in real time as games finish.',
    },
    {
      type: 'cta',
      href: '/stats',
      text: 'View live stats and leaderboards',
      description:
        'See real-time ELO distributions, your personal win rate, and the current top players.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — what the data tells us',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        '42% of players are Bronze, 1% are Master — the pyramid is steep.',
        'Chess and Go have the highest skill ceilings; Critical and Hearts have more variance.',
        'Win streaks above 10 are rare in ranked — ELO matchmaking works.',
        'Track your recent 20-game win rate for an honest skill snapshot.',
      ],
    },
  ],
  faq: [
    {
      question: 'How is ELO calculated on Arcadeum?',
      answer:
        'We use the standard ELO formula with K=32 and a 400-point divisor. Beating a higher-rated player gains more points; losing to a lower-rated player costs more.',
    },
    {
      question: 'How often do seasons reset?',
      answer:
        'Seasons reset quarterly. Your ELO soft-resets toward 1200 (the anchor rating) but your peak is preserved.',
    },
    {
      question: 'Can I see my stats per game?',
      answer:
        'Yes. Your profile shows per-game breakdowns: wins, losses, win rate, current streak, and best streak for each game you have played.',
    },
    {
      question: 'What is the highest ELO on Arcadeum?',
      answer:
        'Master tier starts at 2200. The current highest rated player sits around 2450 in Chess.',
    },
  ],
};
