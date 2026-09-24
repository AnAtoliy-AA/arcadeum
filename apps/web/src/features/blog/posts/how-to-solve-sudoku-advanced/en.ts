import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-solve-sudoku-advanced',
  locale: 'en',
  title:
    'Advanced Sudoku Techniques — X-Wings, Swordfish, Forcing Chains, and More',
  excerpt:
    'Gone past naked pairs and hidden singles? This guide covers the intermediate and advanced elimination techniques that crack the hardest Sudoku puzzles: X-Wings, Swordfish, XY-Chains, and forcing chains explained with grid examples.',
  publishedAt: '2026-09-12',
  author: 'Arcadeum team',
  tags: ['Sudoku', 'Strategy', 'Puzzles', 'Advanced', 'Logic'],
  readingTimeMinutes: 10,
  body: [
    {
      type: 'paragraph',
      text: 'If you can solve easy and medium Sudoku puzzles but get stuck on hard and expert ones, you have probably mastered naked singles, hidden singles, naked pairs, and locked candidates. The next tier of techniques eliminates candidates based on geometric patterns across multiple rows, columns, and boxes — they do not require guessing, only pattern recognition. This guide teaches the key intermediate and advanced techniques in order of complexity.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Quick review: the foundation techniques',
      id: 'foundation',
    },
    {
      type: 'list',
      items: [
        'Naked Single: only one candidate remains in a cell. Fill it in.',
        'Hidden Single: a candidate appears in only one cell within a row, column, or box. Place it.',
        'Naked Pair: two cells in the same unit share exactly the same two candidates. Remove those candidates from all other cells in that unit.',
        'Locked Candidates (Pointing): a candidate appears only in one row or column within a box — eliminate it from the rest of that row or column outside the box.',
        'If you are consistently stuck after these, you need the techniques below.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'X-Wing — the first rectangular pattern',
      id: 'x-wing',
    },
    {
      type: 'paragraph',
      text: 'An X-Wing occurs when a candidate appears in exactly two cells in each of two different rows, and those cells are in the same two columns. Since the candidate must appear in one of the two cells in each row, it must occupy two of the four corners of this rectangle. Whichever corner it takes in row 1, the column that corner is in is "used up" — so the candidate can be eliminated from all other cells in those two columns.',
    },
    {
      type: 'paragraph',
      text: 'Example: Digit 7 appears as a candidate in only cells (r2,c3) and (r2,c8) in row 2, and in only cells (r7,c3) and (r7,c8) in row 7. The four cells form a rectangle. Eliminate all 7s from column 3 and column 8 that are not in rows 2 and 7. The column variant works the same way: if the two columns define the rectangle and the same rows appear, eliminate from those rows.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Swordfish — the triple rectangle',
      id: 'swordfish',
    },
    {
      type: 'paragraph',
      text: 'Swordfish extends X-Wing to three rows and three columns. A candidate forms a Swordfish when it appears in exactly 2 or 3 cells in each of three rows, and those cells collectively span exactly three columns. Again, whichever columns the candidate occupies in those rows, the candidate can be eliminated from the rest of those columns.',
    },
    {
      type: 'paragraph',
      text: 'Example: Digit 4 appears in rows 1, 4, and 7. In row 1: columns 2 and 5. In row 4: columns 2 and 8. In row 7: columns 5 and 8. The three involved columns are 2, 5, and 8. Eliminate all 4s from columns 2, 5, and 8 that are not in rows 1, 4, or 7. This is the Swordfish — the logic is identical to X-Wing but spans one more row.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Naked Triple and Hidden Triple',
      id: 'triples',
    },
    {
      type: 'paragraph',
      text: 'These extend the Naked Pair and Hidden Pair concepts to three cells.',
    },
    {
      type: 'list',
      items: [
        'Naked Triple: three cells in a unit that collectively contain only three candidates (though each cell may have 2 or 3 of those candidates). Those three candidates can be eliminated from all other cells in the unit.',
        'Hidden Triple: three candidates that appear in only three cells of a unit (though those cells may have other candidates too). Eliminate all other candidates from those three cells.',
        'The key insight: you do not need each cell to contain all three candidates. In a Naked Triple {1,2}, {2,3}, {1,3} — each cell has only two of the three, but collectively they "own" 1, 2, and 3.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'XY-Wing — a chain of three cells',
      id: 'xy-wing',
    },
    {
      type: 'paragraph',
      text: 'An XY-Wing (also called a Y-Wing) is a chain of three cells, each with exactly two candidates, where the candidates connect in a specific way. The pivot cell has candidates XY. Two "pincer" cells share one candidate with the pivot: one has XZ, the other has YZ. Since the pivot is either X or Y, one of the pincers must be Z — so you can eliminate Z from any cell that sees both pincers.',
    },
    {
      type: 'paragraph',
      text: 'Example: Pivot at r5,c5 has candidates {3,7}. Pincer 1 at r5,c1 has candidates {3,9}. Pincer 2 at r8,c5 has candidates {7,9}. If the pivot is 3, pincer 1 is 9. If the pivot is 7, pincer 2 is 9. In either case, 9 must appear in one of the two pincers. Eliminate 9 from any cell that sees both pincers — e.g. cell r8,c1.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Forcing Chains — the final frontier',
      id: 'forcing-chains',
    },
    {
      type: 'paragraph',
      text: 'Forcing chains are chains of logical implications. You hypothesize that a candidate in a cell is true (or false) and follow the chain of forced consequences. If both assumptions lead to the same conclusion, that conclusion must be true regardless.',
    },
    {
      type: 'list',
      items: [
        'Simple chain: cell A has candidates {1,2}. If A=1, then B=5 (only candidate remaining). If A=2, then B=5 (different chain, same result). Therefore B=5.',
        'Contradiction chain (Nishio): assume candidate X is true in cell A. Follow all forced consequences. If you reach a contradiction (a unit with no valid cell for a candidate), then X is false in A — eliminate it.',
        'Continuous nice loops: a chain of cells where each step alternates between "on" (this candidate is here) and "off" (this candidate is not here). If the loop closes consistently, you can eliminate candidates from cells that see both endpoints.',
        'When to use: forcing chains are the last resort before trial-and-error. They should only be needed on the hardest "expert" puzzles — if you are using them on hard puzzles, check whether you missed an X-Wing or Swordfish first.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Unique Rectangle — using the uniqueness property',
      id: 'unique-rectangle',
    },
    {
      type: 'paragraph',
      text: 'A properly set Sudoku has exactly one solution. The Unique Rectangle technique exploits this: if you can identify a 2×2 rectangle of four cells (in exactly two rows, two columns, and two boxes) where all four cells share the same two candidates, then one of those cells must have an additional candidate — otherwise the puzzle would have two solutions.',
    },
    {
      type: 'list',
      items: [
        'Type 1: three of the four cells have exactly {A,B} and the fourth has {A,B,C}. Eliminate A and B from the fourth cell — C must be the value.',
        'Type 2: two cells in the same row (or column) of the rectangle both have an extra candidate C. Eliminate C from all cells that see both of them.',
        'This is logically valid only if the puzzle is guaranteed to have a unique solution — which all well-formed Sudoku puzzles do.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Technique priority order',
      id: 'priority',
    },
    {
      type: 'list',
      items: [
        '1. Naked/Hidden Singles (always check first — fast and frequent)',
        '2. Locked Candidates (pointing and claiming)',
        '3. Naked/Hidden Pairs, Triples, and Quads',
        '4. X-Wing and Swordfish',
        '5. XY-Wing and XYZ-Wing',
        '6. Unique Rectangle',
        '7. Forcing chains and contradiction chains',
        'Work through the list in order. The simpler the technique, the more often it applies — do not jump to Swordfish when you have not exhausted Naked Pairs.',
      ],
    },
    {
      type: 'cta',
      href: '/games/sudoku',
      text: 'Apply these techniques — play Sudoku on Arcadeum',
      description:
        'Multiple difficulty levels from easy to expert. Try the techniques from this guide on a hard or expert puzzle.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — technique cheat sheet',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'X-Wing: same candidate in exactly 2 cells in 2 rows, same 2 columns → eliminate from rest of those columns.',
        'Swordfish: same candidate in 2-3 cells in 3 rows, spanning 3 columns → eliminate from rest of those columns.',
        'XY-Wing: pivot cell XY + two pincers XZ and YZ → eliminate Z from cells seeing both pincers.',
        'Forcing chain: assume a candidate is true or false, follow consequences — if both assumptions lead to the same result, that result is forced.',
        'Unique Rectangle: a 2×2 rectangle of two candidates in two boxes → extra candidates in floor cells can be eliminated.',
      ],
    },
  ],
  faq: [
    {
      question: 'Do I need forcing chains to solve hard Sudoku?',
      answer:
        'Usually not. Most published hard puzzles can be solved with X-Wing, Swordfish, XY-Wing, and Unique Rectangle. Forcing chains become necessary for the hardest "extreme" or "expert" puzzles. Before using chains, double-check that you have not missed a simpler pattern.',
    },
    {
      question: 'Is guessing ever required?',
      answer:
        'A well-constructed Sudoku puzzle with a unique solution can always be solved by logic alone — no guessing required. If you feel stuck, it usually means a pattern exists that you have not found yet, not that guessing is the only option.',
    },
    {
      question: 'What is the difference between X-Wing and Swordfish?',
      answer:
        'X-Wing involves two rows and two columns (a 2×2 rectangle). Swordfish involves three rows and three columns. Swordfish is the natural extension of X-Wing to one more dimension. Jellyfish extends to four rows and four columns — rarely needed in practice.',
    },
    {
      question: 'What is the hardest known Sudoku puzzle?',
      answer:
        '"Al Escargot" (designed by Arto Inkala, 2006) and "hardest Sudoku" (Inkala, 2012) are considered among the hardest human-solvable Sudoku puzzles. They require extended forcing chains and are rated harder than any X-Wing or Swordfish pattern.',
    },
  ],
};
