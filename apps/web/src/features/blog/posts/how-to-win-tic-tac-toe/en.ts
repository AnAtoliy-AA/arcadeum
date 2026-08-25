import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-win-tic-tac-toe',
  locale: 'en',
  title: 'How to Win at Tic Tac Toe — Strategy, Forks, First & Second Player',
  excerpt:
    'A complete strategy guide to Tic Tac Toe: the first-player advantage, second-player defence, creating forks, and the habits that turn draws into wins.',
  publishedAt: '2026-06-30',
  author: 'Arcadeum team',
  tags: ['Tic Tac Toe', 'How to Play', 'Strategy', 'Board Game', 'Logic'],
  readingTimeMinutes: 5,
  body: [
    {
      type: 'paragraph',
      text: 'Tic Tac Toe is a solved game — with perfect play from both sides, every game is a draw. But in practice, most opponents make mistakes, and the player who understands the strategy will punish those mistakes consistently. This guide covers the first-player advantage, second-player defence, and the fork technique that wins games.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The rules',
      id: 'rules',
    },
    {
      type: 'paragraph',
      text: 'Two players take turns placing X or O on a 3x3 grid. X goes first. Three in a row (horizontal, vertical, or diagonal) wins. A full board with no three-in-a-row is a draw.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Playing as first player (X)',
      id: 'first-player',
    },
    {
      type: 'paragraph',
      text: 'Open in the centre — this is the strongest opening. The centre creates the most possible winning lines (four: two diagonals, one row, one column). If your opponent responds with an edge square, X can force a win with correct play. If your opponent takes a corner, play the opposite corner to set up traps. Never open on an edge — it gives the second player a forced advantage.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Playing as second player (O)',
      id: 'second-player',
    },
    {
      type: 'paragraph',
      text: 'If X opens centre, O must take a CORNER — an edge reply loses by force. If X opens corner, O must take the CENTRE. If X opens edge (rare at high level), O should take the centre. The key principle: the centre is the most valuable square, corners are second, edges are weakest.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Forks — the winning technique',
      id: 'forks',
    },
    {
      type: 'paragraph',
      text: "A fork is a position where you create two simultaneous winning threats. Your opponent can only block one, so you win on the next move. Build forks via opposite corners or L-shaped setups. Before every move, scan for potential forks — both creating your own and blocking your opponent's.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Priority checklist',
      id: 'priority',
    },
    {
      type: 'list',
      items: [
        'Win now. If you have two in a row with an open third, take it.',
        'Block. If the opponent has two in a row with an open third, block it.',
        'Create a fork. Set up two threats at once.',
        'Block a fork. If the opponent can create a fork, play to block it by forcing them to defend.',
        'Take the centre or corners if none of the above applies.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Common mistakes',
      id: 'mistakes',
    },
    {
      type: 'list',
      items: [
        'Opening on an edge. This is the weakest opening and leads to a lost position against correct play.',
        'Not blocking forks. A player who creates a fork wins — always scan for fork threats.',
        'Playing too fast. Even in a simple game, one careless move creates a fork for the opponent.',
        'Ignoring the opposite-corner trap. If X opens corner and O responds with opposite corner, X must take centre or edge — not another corner.',
      ],
    },
    {
      type: 'cta',
      href: '/games/tic-tac-toe',
      text: 'Play Tic Tac Toe online — free, in your browser',
      description:
        'Challenge friends or AI bots. Test your strategy in classic 3x3 or larger variants.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — the four habits that win games',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Open centre as X, take corner if opponent opens centre.',
        'Create forks (two threats at once) whenever possible.',
        'Always scan for opponent fork threats before every move.',
        'Never open on an edge — it is the weakest square.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Tic Tac Toe rewards awareness and the discipline to think one move ahead. With the strategies above, you will draw against perfect play and win against imperfect play every time.',
    },
  ],
  howTo: {
    totalTime: 'PT5M',
    steps: [
      {
        name: 'Open centre as X',
        text: 'The centre gives you four winning lines. Always start here as first player.',
        url: '#first-player',
      },
      {
        name: 'Defend with corners as O',
        text: 'If X opens centre, take a corner. If X opens corner, take centre.',
        url: '#second-player',
      },
      {
        name: 'Create forks',
        text: 'Set up two winning threats at once. The opponent can only block one.',
        url: '#forks',
      },
      {
        name: 'Block opponent forks',
        text: 'Before every move, check if the opponent can create a fork. Block it.',
        url: '#forks',
      },
    ],
  },
};
