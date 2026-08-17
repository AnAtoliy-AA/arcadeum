import { validateSeaBattleConfig } from './sea-battle/sea-battle.config';
import { validateCheckersConfig } from './checkers/checkers.config';
import { validateTicTacToeConfig } from './tic-tac-toe/tic-tac-toe.config';
import { validateCascadeConfig } from './cascade/cascade.config';

describe('AI difficulty config validation', () => {
  it.each(['easy', 'medium', 'hard', 'expert'])(
    'sea battle accepts %s aiDifficulty',
    (d) => {
      expect(validateSeaBattleConfig({ aiDifficulty: d })).toBe(true);
    },
  );

  it('sea battle rejects an unknown aiDifficulty', () => {
    expect(validateSeaBattleConfig({ aiDifficulty: 'impossible' })).toBe(false);
  });

  it.each(['easy', 'medium', 'hard', 'expert'])(
    'checkers accepts %s botDifficulty',
    (d) => {
      expect(validateCheckersConfig({ botDifficulty: d })).toBe(true);
    },
  );

  it('checkers rejects an unknown botDifficulty', () => {
    expect(validateCheckersConfig({ botDifficulty: 'impossible' })).toBe(false);
  });

  it.each(['easy', 'medium', 'hard', 'expert'])(
    'tic-tac-toe accepts %s aiDifficulty (flat + nested)',
    (d) => {
      expect(validateTicTacToeConfig({ aiDifficulty: d })).toBe(true);
      expect(validateTicTacToeConfig({ options: { aiDifficulty: d } })).toBe(
        true,
      );
    },
  );

  it('tic-tac-toe rejects an unknown aiDifficulty', () => {
    expect(validateTicTacToeConfig({ aiDifficulty: 'impossible' })).toBe(false);
  });

  it.each(['easy', 'medium', 'hard', 'expert'])(
    'cascade accepts %s aiDifficulty (flat + nested)',
    (d) => {
      expect(validateCascadeConfig({ aiDifficulty: d })).toBe(true);
      expect(validateCascadeConfig({ options: { aiDifficulty: d } })).toBe(
        true,
      );
    },
  );

  it('cascade rejects an unknown aiDifficulty', () => {
    expect(validateCascadeConfig({ aiDifficulty: 'impossible' })).toBe(false);
  });
});
