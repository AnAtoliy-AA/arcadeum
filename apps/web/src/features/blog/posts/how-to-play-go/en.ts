import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-go',
  locale: 'en',
  title: 'How to Play Go (Baduk, Weiqi) Online — Rules, Life & Death, Strategy',
  excerpt:
    'A complete beginner-friendly guide to Go: board setup, liberties, capturing, ko, territory, and the strategic concepts that separate beginners from experienced players.',
  publishedAt: '2026-06-23',
  author: 'Arcadeum team',
  tags: ['Go', 'Baduk', 'Weiqi', 'How to Play', 'Strategy', 'Board Game'],
  readingTimeMinutes: 9,
  body: [
    {
      type: 'paragraph',
      text: 'Go (known as Baduk in Korean and Weiqi in Chinese) is the oldest board game still played in its original form. Two players place black and white stones on a 19x19 grid, trying to control the most territory. The rules are simple enough to learn in five minutes, but the strategic depth is so vast that computers only recently achieved superhuman play. This guide covers the rules, life and death, and the opening concepts that shape every game.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The board and basics',
      id: 'basics',
    },
    {
      type: 'paragraph',
      text: 'Go is played on a 19x19 grid of intersections (9x9 and 13x13 are used for beginners). Black plays first and places one stone per turn on any empty intersection. Stones, once placed, do not move — they are only removed when captured. The game ends when both players pass consecutively.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Liberties and capturing',
      id: 'liberties',
    },
    {
      type: 'paragraph',
      text: "A stone's liberties are the empty intersections directly adjacent to it (up, down, left, right — not diagonal). A group of connected stones shares liberties. When a stone or group has zero liberties (completely surrounded), it is captured and removed from the board. This is the fundamental mechanic of Go.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Ko rule',
      id: 'ko',
    },
    {
      type: 'paragraph',
      text: 'The ko rule prevents infinite loops: if a capture creates a position that existed on the previous move, the opponent cannot immediately recapture — they must play elsewhere first. This prevents the game from cycling forever.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Life and death — two eyes',
      id: 'life-death',
    },
    {
      type: 'paragraph',
      text: 'A group of stones is alive (cannot be captured) if it has two separate internal liberties called "eyes." An eye is an empty intersection surrounded by your stones. A group with two eyes cannot be captured because the opponent would need to fill both eyes simultaneously, which is impossible on a single turn. Recognising live and dead groups is the most important skill in Go.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Territory and scoring',
      id: 'territory',
    },
    {
      type: 'paragraph',
      text: "The goal is to surround more territory (empty intersections) than your opponent. Area scoring (Chinese rules): count your stones + surrounded territory. Territory scoring (Japanese rules): count surrounded territory minus captured stones. Both systems produce similar results. The komi (compensation for white, typically 6.5 or 7.5 points) offsets black's first-move advantage.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Opening strategy — corners, sides, centre',
      id: 'opening',
    },
    {
      type: 'paragraph',
      text: 'Go proverbs guide the opening: "Corners first, sides second, centre last." Corners are easiest to secure (fewer directions to defend). Sides are next. The centre is hardest to turn into territory. Common opening patterns (joseki) establish balanced positions in the corners. Aim to play on the third and fourth lines — third line is territory, fourth line is influence.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Tactical concepts',
      id: 'tactics',
    },
    {
      type: 'list',
      items: [
        'Atari. A stone or group with exactly one liberty left — one move from capture. The opponent must respond or lose the stones.',
        'Ladders. A chasing pattern where the attacker keeps putting the opponent in atari. If the ladder works across the board, the defender cannot escape.',
        'Nets. A containment pattern that traps stones without directly attacking them — the opponent cannot break out.',
        'Cutting and connecting. Cutting separates opponent groups (weaker individually). Connecting strengthens your own groups. "Cut early" is a common beginner tip.',
        'Sente and gote. Sente = a move your opponent must respond to (you keep the initiative). Gote = a move that does not demand a response (opponent gets initiative). Maximise sente moves.',
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
        'Playing too much in the centre early. Centre stones rarely secure territory efficiently.',
        'Ignoring life and death. Playing tenuki (playing elsewhere) when your group is unsettled can lose the group.',
        'Over-concentrating. Having too many stones in one area wastes potential — they could be securing territory elsewhere.',
        'Filling your own eyes. Accidentally filling your own eye liberties can kill your group.',
      ],
    },
    {
      type: 'cta',
      href: '/games/go',
      text: 'Play Go online — free, in your browser',
      description:
        'Challenge friends or AI bots on 9x9, 13x13, or full 19x19 boards. Multiple handicap options available.',
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
        'Secure corners first, then sides, then consider the centre.',
        'Always check life and death of your groups before playing elsewhere.',
        'Play on the third line for territory, fourth line for influence.',
        'Keep the initiative (sente) — force your opponent to respond.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Go is a game where small, consistent advantages compound over hundreds of moves. The player who secures more efficient positions across the whole board wins. Study life and death, respect the proverbs, and play many games to develop intuition.',
    },
  ],
  howTo: {
    totalTime: 'PT25M',
    steps: [
      {
        name: 'Corners first, sides second',
        text: 'Secure corner territory early. Corners are easiest to defend with fewer open sides.',
        url: '#opening',
      },
      {
        name: 'Learn to read liberties',
        text: 'Always know how many liberties your groups have. Groups with one liberty (atari) need immediate attention.',
        url: '#liberties',
      },
      {
        name: 'Make two eyes',
        text: 'A group with two separate eyes is alive and cannot be captured. This is the most important concept in Go.',
        url: '#life-death',
      },
      {
        name: 'Keep sente',
        text: 'Play moves your opponent must respond to. Losing the initiative means your opponent sets the pace.',
        url: '#tactics',
      },
    ],
  },
};
