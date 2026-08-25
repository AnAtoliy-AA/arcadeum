import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'climbing-ranked',
  locale: 'en',
  title:
    'How to Climb Ranked on Arcadeum — ELO Strategy, Tier System, and Grinding Tips',
  excerpt:
    'A practical guide to climbing the Arcadeum ranked ladder: how ELO works, what each tier means, and the habits that separate Bronze from Diamond.',
  publishedAt: '2026-08-25',
  author: 'Arcadeum team',
  tags: ['ELO', 'Ranked', 'Strategy', 'Leaderboard', 'Tips'],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: "Ranked is where Arcadeum gets real. You start at 1200 ELO in Bronze, and every win or loss moves you up or down the ladder. The system is designed to match you against players of similar strength — so climbing requires getting genuinely better, not just grinding. Here's how the system works and what actually helps you climb.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'How ELO works',
      id: 'elo',
    },
    {
      type: 'stat-card',
      title: 'ELO System at a Glance',
      stats: [
        { value: '1200', label: 'Starting ELO', description: 'Bronze tier' },
        {
          value: 'K=32',
          label: 'K-Factor',
          description: 'Points per win/loss',
        },
        {
          value: '400',
          label: 'Divisor',
          description: 'Rating difference scale',
        },
        { value: '6.5', label: 'Komi (Go)', description: 'White compensation' },
      ],
    },
    {
      type: 'paragraph',
      text: 'When you beat a higher-rated player, you gain more ELO. When you lose to a lower-rated player, you lose more. This means beating someone 200 points above you is worth roughly twice as much as beating someone at your level. The system rewards you for beating stronger opponents, not just for winning.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Tier thresholds',
      id: 'tiers',
    },
    {
      type: 'list',
      items: [
        'Bronze (1200-1399). The starting tier. Most games here are decided by basic mistakes — hanging pieces, missed captures, poor endgame.',
        'Silver (1400-1599). Players know the rules well. Games are decided by tactics and opening knowledge.',
        'Gold (1600-1799). Solid fundamentals. The gap between Gold and Platinum is where most players plateau.',
        'Platinum (1800-1999). Strong tactical vision. Mistakes are rare and usually punished immediately.',
        'Diamond (2000-2199). Excellent positional understanding. Games are decided by small advantages accumulated over many moves.',
        'Master (2200+). Near-flawless technique. Games are often decided by one mistake in 40+ moves.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'The climbing habits',
      id: 'habits',
    },
    {
      type: 'list',
      items: [
        'Play fewer games, analyze more. Playing 20 games without review is less effective than playing 5 and analyzing each one. Look for the 2-3 moves where you lost the most advantage.',
        'Specialize in one game. Spreading across all games keeps you a generalist. Pick one game and go deep — your ELO will climb faster.',
        'Manage tilt. Losing 3 in a row means you should stop. Tilt causes sloppy play, which causes more losses, which causes more tilt.',
        'Study your tier. Watch replays of players 200-300 ELO above you. Notice what they do differently in positions you find difficult.',
        'Endgame study. At Bronze and Silver, games are often decided in the endgame. Learning basic endgames (opposition, key squares, basic checkmates) wins more games than memorizing openings.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Season resets',
      id: 'seasons',
    },
    {
      type: 'paragraph',
      text: "Every quarter, seasons reset. Your ELO soft-resets toward 1200 (the anchor rating), but your peak ELO is preserved on your profile. The first two weeks of a new season are chaotic — strong players are mixed with newer ones. This is actually a good time to climb: the matchmaking is less accurate, so you can gain ground quickly if you're underrated.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Common plateau patterns',
      id: 'plateaus',
    },
    {
      type: 'list',
      items: [
        'Silver to Gold. Usually caused by weak endgame or opening traps. Study basic endgames and learn 2-3 solid openings.',
        'Gold to Platinum. Usually caused by tactical blindness. Solve puzzles or analyze your losses for missed tactics.',
        'Platinum to Diamond. Usually caused by positional misunderstanding. Study pawn structures and piece coordination.',
        'Diamond to Master. Usually caused by inconsistency. You already know everything — you just need to do it every game.',
      ],
    },
    {
      type: 'cta',
      href: '/games/chess',
      text: 'Start climbing — play a ranked game',
      description:
        'Your ELO is tracked automatically. Check your profile after the game to see your new rating.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR - the climbing formula',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Specialize in one game instead of playing all of them.',
        'Analyze your losses more than you play new games.',
        'Stop after 3 losses in a row — tilt is real.',
        'Study endgames at Bronze/Silver, tactics at Gold/Platinum.',
      ],
    },
  ],
  faq: [
    {
      question: 'How many points do I gain per win?',
      answer:
        'Depends on the rating difference. Beating someone at your level gains about 16 points. Beating someone 200 above gains about 25. Beating someone 200 below gains about 7.',
    },
    {
      question: 'What happens when seasons reset?',
      answer:
        'Your ELO soft-resets toward 1200 but your peak is preserved. You keep your tier badges from previous seasons.',
    },
    {
      question: 'Can I lose ELO below 1200?',
      answer:
        'No. 1200 is the floor for new players. Once you have played 10+ ranked games, ELO can go below 1200 but the system prevents extreme drops.',
    },
    {
      question: 'Is there placement matches?',
      answer:
        'No. You start at 1200 and your ELO adjusts from there. The K-factor is slightly higher for your first 20 games to help the system find your level faster.',
    },
  ],
};
