import {
  cardPoints,
  holderOfTwoClubs,
  makeDeck,
  passDirectionForHand,
  pointsInCards,
  rankValue,
  receiverIndexOf,
  shootTheMoonShooter,
  sortHand,
  trickWinnerId,
} from './hearts.utils';

describe('hearts.utils', () => {
  describe('makeDeck', () => {
    it('creates the standard 52-card deck', () => {
      const deck = makeDeck();
      expect(deck).toHaveLength(52);
      expect(new Set(deck).size).toBe(52);
      expect(deck).toContain('2C');
      expect(deck).toContain('QS');
      expect(deck).toContain('10H');
      expect(deck).toContain('AH');
    });
  });

  describe('rankValue / sortHand', () => {
    it('maps ranks to 2..14', () => {
      expect(rankValue('2C')).toBe(2);
      expect(rankValue('10H')).toBe(10);
      expect(rankValue('AS')).toBe(14);
    });

    it('sorts by suit then rank', () => {
      expect(sortHand(['AH', '2C', 'KS', '10D'])).toEqual([
        '2C',
        '10D',
        'KS',
        'AH',
      ]);
    });
  });

  describe('passDirectionForHand', () => {
    it('rotates left → right → across → hold', () => {
      expect(passDirectionForHand(0)).toBe('left');
      expect(passDirectionForHand(1)).toBe('right');
      expect(passDirectionForHand(2)).toBe('across');
      expect(passDirectionForHand(3)).toBe('hold');
      expect(passDirectionForHand(4)).toBe('left');
    });
  });

  describe('receiverIndexOf', () => {
    it.each([
      [0, 'left', 1],
      [3, 'left', 0],
      [0, 'right', 3],
      [0, 'across', 2],
      [1, 'hold', 1],
    ] as const)('%i %s → %i', (sender, dir, expected) => {
      expect(receiverIndexOf(sender, dir, 4)).toBe(expected);
    });
  });

  describe('cardPoints / pointsInCards', () => {
    it('scores hearts as 1, Q♠ as 13, others 0', () => {
      expect(cardPoints('5H')).toBe(1);
      expect(cardPoints('QS')).toBe(13);
      expect(cardPoints('AS')).toBe(0);
      expect(pointsInCards(['5H', 'QS', 'AC'])).toBe(14);
    });
  });

  describe('trickWinnerId', () => {
    const plays = [
      { playerId: 'p1', card: '5D' },
      { playerId: 'p2', card: 'JD' },
      { playerId: 'p3', card: '2H' },
      { playerId: 'p4', card: '9D' },
    ];

    it('awards the trick to the highest card of the led suit', () => {
      expect(trickWinnerId(plays)).toBe('p2');
    });

    it('returns null for incomplete tricks', () => {
      expect(trickWinnerId([])).toBeNull();
      expect(trickWinnerId(plays.slice(0, 2))).toBe('p2');
    });
  });

  describe('shootTheMoonShooter', () => {
    it('detects the player with all 26 points', () => {
      const handScores = { a: 26, b: 0, c: 0, d: 0 };
      expect(shootTheMoonShooter(handScores)).toBe('a');
    });

    it('returns null without a shooter', () => {
      expect(shootTheMoonShooter({ a: 5, b: 21 })).toBeNull();
    });
  });

  describe('holderOfTwoClubs', () => {
    it('finds the 2♣ holder index', () => {
      const hands = { a: ['2C'], b: ['3C'], c: [], d: [] };
      const order = ['a', 'b', 'c', 'd'];
      expect(holderOfTwoClubs(hands, order)).toBe(0);
      expect(holderOfTwoClubs({ a: [], b: [], c: ['2C'], d: [] }, order)).toBe(
        2,
      );
      expect(holderOfTwoClubs({ a: [], b: [], c: [], d: [] }, order)).toBe(-1);
    });
  });
});
