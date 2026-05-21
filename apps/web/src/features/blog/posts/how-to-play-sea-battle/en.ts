import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-sea-battle',
  locale: 'en',
  title: 'How to Play Sea Battle (Battleship) Online — Rules, Setup, Strategy',
  excerpt:
    'A full beginner-friendly guide to Sea Battle / Battleship online: official rules, fleet setup, hunt-and-target search, and the habits that separate casual players from admirals who consistently sink first.',
  publishedAt: '2026-05-21',
  author: 'Arcadeum team',
  tags: ['Sea Battle', 'Battleship', 'How to Play', 'Strategy', 'Tutorial'],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: "Sea Battle — known internationally as Battleship — is one of the oldest grid-based strategy games still in active play. Two opponents secretly arrange a fleet of ships on a 10×10 grid, then take turns firing at coordinates on each other's grid. The first player to sink every enemy ship wins. The rules are simple enough to teach in two minutes, but a few small habits separate casual players from the admirals who consistently sink first. This guide covers the official rules, the standard fleet, the most common opening, and the search and placement strategies that actually win games — all framed for playing Sea Battle online.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Setup: the 10×10 grid and the standard fleet',
      id: 'setup',
    },
    {
      type: 'paragraph',
      text: 'Each player owns two 10×10 grids: an Ocean Grid where they place their own fleet, and a Target Grid where they record hits and misses on the opponent. Columns are labelled A–J and rows are labelled 1–10, so any cell can be addressed by a coordinate like B7 or J3. In the canonical ruleset every player gets the same five ships: one Carrier (5 cells), one Battleship (4 cells), one Cruiser (3 cells), one Submarine (3 cells), and one Destroyer (2 cells) — 17 total cells of ships across the 100-cell grid.',
    },
    {
      type: 'paragraph',
      text: "Ships are placed orthogonally — straight lines, horizontal or vertical — and the canonical rule is that ships cannot overlap and cannot touch. Whether two ships are allowed to share an edge is the most common house-rule split: tournament play forbids it, casual play often allows it. Pick a convention with your opponent before the first salvo. On Arcadeum's Sea Battle implementation, both rule sets are available — the room creator picks which one applies for the match.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'How a turn works',
      id: 'turn',
    },
    {
      type: 'paragraph',
      text: 'On your turn you call out a single coordinate (e.g. F6). Your opponent looks at their Ocean Grid, declares either "hit" (your shot landed on one of their ships) or "miss" (it landed in open water), and marks the cell on their own grid. You mark the same coordinate on your Target Grid — red for a hit, white for a miss — so you keep an evolving map of where the opponent\'s fleet must be. When every cell of a ship is hit, the owner announces the sinking ("You sank my Cruiser"), which is critical information for the attacker because it confirms that the surrounding cells are now safe to ignore.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Placement strategy — three habits to start with',
      id: 'placement',
    },
    {
      type: 'list',
      items: [
        'Spread, do not cluster. Put each ship in its own quadrant when you can. Clustered fleets cascade — a single lucky hit hands the opponent two or three quick sinkings in a row.',
        'Avoid the edges. The board rim feels safe, but experienced opponents sweep the perimeter first because edge-placed ships have fewer escape directions. Float your fleet a cell or two off the rim.',
        "Mix orientations. If all five ships are horizontal, a vertical search pattern walks straight into them. Rotate at least two ships so the opponent's search pattern can't catch the whole fleet in one direction.",
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Search strategy — checkerboard, then hunt-and-target',
      id: 'search',
    },
    {
      type: 'paragraph',
      text: 'Until you score your first hit, you are searching. The most efficient search pattern is a checkerboard — fire on every other cell, like a queen on a chess board. The shortest ship in the fleet is two cells long, so a checkerboard pattern guarantees that you will eventually touch every ship without scanning every cell. This roughly halves the cells you need to try before the first hit, which matters more than any single placement decision.',
    },
    {
      type: 'paragraph',
      text: 'After your first hit, switch from search to hunt-and-target. Fire at the four cells adjacent to the hit (north, south, east, west) until you land another hit, then continue firing along that line until the opponent announces the sinking. The moment the ship sinks, return to the checkerboard — you now know that all the cells surrounding the sunken ship are safe to ignore, which is a much larger search-space reduction than it looks.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Track misses, not just hits',
      id: 'misses',
    },
    {
      type: 'paragraph',
      text: 'Misses are information. Each miss tells you a specific cell does not contain a ship, which shrinks the remaining search space by one cell. By the mid-game, the dead zones (clusters of misses) usually outline the regions where the remaining ships must be. Most online Sea Battle implementations show miss markers permanently so you do not need to memorize them, but the principle is the same: every shot you take produces actionable information about the next shot.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Common variants you will see online',
      id: 'variants',
    },
    {
      type: 'list',
      items: [
        'Salvo. Each turn you fire as many shots as you have surviving ships, all at once. Speeds up endgame dramatically.',
        'Team mode. Two-vs-two or larger, with shared grids and team chat. Coordination becomes the dominant skill.',
        'Hidden ships. Ships are not announced when sunk — you only learn the win condition when you hit the last cell. Brutally hard but rewarding for experienced players.',
        'Themed boards. Visual reskins (vintage maps, neon cyberpunk, deep space). Mechanics are unchanged but the experience feels distinct.',
      ],
    },
    {
      type: 'cta',
      href: '/games/sea-battle',
      text: 'Play Sea Battle online — free, in your browser',
      description:
        'Open a Sea Battle room, share the link with friends, or fill seats with AI bots. All the modes above are available out of the box.',
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
        'Place ships off the edges and in separate quadrants.',
        'Search in a checkerboard until you score the first hit.',
        'After a hit, hunt-and-target along the line until the ship sinks, then return to the search pattern.',
        'Track misses as actively as hits — they tell you where ships are not.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Sea Battle is a game where small, consistent habits compound into a real edge. The rules are old enough that there is no secret strategy nobody has tried — but the four habits above are robust enough that a player who applies them all will outperform a player who applies none of them, every time. Play a few rounds, mark your improvements, and adjust.',
    },
  ],
};
