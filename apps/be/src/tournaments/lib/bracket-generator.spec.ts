import {
  generateSingleEliminationBracket,
  generateRoundRobinBracket,
  resolveSingleEliminationAdvance,
  type BracketMatch,
} from './bracket-generator';

const ids = (...n: number[]): string[] => n.map(String);

function flat(bracket: { rounds: BracketMatch[][] }): BracketMatch[] {
  return bracket.rounds.flat();
}

describe('generateSingleEliminationBracket', () => {
  it.each([
    [2, 1],
    [4, 2],
    [5, 3],
    [6, 3],
    [8, 3],
  ])('%i players → %i rounds', (players, expectedRounds) => {
    const bracket = generateSingleEliminationBracket(ids(...range(players)));
    expect(bracket.format).toBe('single_elimination');
    expect(bracket.rounds).toHaveLength(expectedRounds);
  });

  it('pairs 4 players sequentially with an empty final', () => {
    const bracket = generateSingleEliminationBracket(ids(1, 2, 3, 4));
    expect(bracket.rounds).toEqual([
      [
        { round: 1, matchIndex: 0, playerIds: ['1', '2'], winnerUserId: null },
        { round: 1, matchIndex: 1, playerIds: ['3', '4'], winnerUserId: null },
      ],
      [
        {
          round: 2,
          matchIndex: 0,
          playerIds: [null, null],
          winnerUserId: null,
        },
      ],
    ]);
  });

  it('gives 5 players one trailing bye match in round 1', () => {
    const bracket = generateSingleEliminationBracket(ids(1, 2, 3, 4, 5));
    const [round1] = bracket.rounds;
    expect(round1).toHaveLength(3);
    expect(round1?.[2]?.playerIds).toEqual(['5', null]);
    // No round-1 match may have two empty slots; later rounds start
    // empty and are filled via advance placements.
    expect(bracket.rounds).toHaveLength(3);
    expect(bracket.rounds[1]).toHaveLength(2);
    expect(bracket.rounds[2]).toHaveLength(1);
    for (const match of round1 ?? []) {
      expect(match.playerIds.filter((p) => p !== null).length).toBeGreaterThan(
        0,
      );
    }
  });

  it('every player appears exactly once across round 1', () => {
    const players = ids(1, 2, 3, 4, 5);
    const bracket = generateSingleEliminationBracket(players);
    const seen = (bracket.rounds[0] ?? [])
      .flatMap((m) => m.playerIds)
      .filter((p): p is string => p !== null)
      .sort();
    expect(seen).toEqual([...players].sort());
  });
});

describe('generateRoundRobinBracket', () => {
  it('6 players → 5 rounds × 3 matches, 15 unique pairs, 5 matches each', () => {
    const players = ids(1, 2, 3, 4, 5, 6);
    const bracket = generateRoundRobinBracket(players);

    expect(bracket.format).toBe('round_robin');
    expect(bracket.rounds).toHaveLength(5);
    for (const round of bracket.rounds) {
      expect(round).toHaveLength(3);
    }

    const matches = flat(bracket);
    expect(matches).toHaveLength(15);

    const pairs = new Set(
      matches.map((m) => [m.playerIds[0], m.playerIds[1]].sort().join('|')),
    );
    expect(pairs.size).toBe(15);

    const appearances: Record<string, number> = {};
    for (const match of matches) {
      for (const p of match.playerIds) {
        if (p !== null) appearances[p] = (appearances[p] ?? 0) + 1;
      }
    }
    expect(appearances).toEqual({
      '1': 5,
      '2': 5,
      '3': 5,
      '4': 5,
      '5': 5,
      '6': 5,
    });
  });

  it('odd count adds a null bye participant (3 players)', () => {
    const bracket = generateRoundRobinBracket(ids(1, 2, 3));
    const matches = flat(bracket);
    // Padded field of 4 → 3 rounds × 2 matches.
    expect(bracket.rounds).toHaveLength(3);
    expect(matches).toHaveLength(6);

    const realPairs = new Set(
      matches
        .filter((m) => m.playerIds.every((p) => p !== null))
        .map((m) => (m.playerIds as [string, string]).slice().sort().join('|')),
    );
    expect(realPairs).toEqual(new Set(['1|2', '1|3', '2|3']));
  });
});

describe('resolveSingleEliminationAdvance', () => {
  it('places a 4-player winner into the final slot', () => {
    const rounds = generateSingleEliminationBracket(ids(1, 2, 3, 4)).rounds;
    expect(resolveSingleEliminationAdvance(rounds, 1, 0, '9')).toEqual([
      { round: 2, matchIndex: 0, playerId: '9' },
    ]);
  });

  it('reports nothing after the final is won', () => {
    const rounds = generateSingleEliminationBracket(ids(1, 2, 3, 4)).rounds;
    expect(resolveSingleEliminationAdvance(rounds, 2, 0, '9')).toEqual([]);
  });

  it('cascades bye auto-advance for 5 players', () => {
    const rounds = generateSingleEliminationBracket(ids(1, 2, 3, 4, 5)).rounds;

    // Round 1 match 2 is the bye match [5, null]: its winner lands in
    // round 2 match 1 whose sibling feeder does not exist, so the winner
    // cascades straight into the final.
    expect(resolveSingleEliminationAdvance(rounds, 1, 2, '5')).toEqual([
      { round: 2, matchIndex: 1, playerId: '5' },
      { round: 3, matchIndex: 0, playerId: '5' },
    ]);
  });

  it('stops cascading when the sibling feeder match exists', () => {
    const rounds = generateSingleEliminationBracket(ids(1, 2, 3, 4, 5)).rounds;

    // Round 1 match 0 winner waits for match 1 winner in round 2.
    expect(resolveSingleEliminationAdvance(rounds, 1, 0, '7')).toEqual([
      { round: 2, matchIndex: 0, playerId: '7' },
    ]);
  });
});

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}
