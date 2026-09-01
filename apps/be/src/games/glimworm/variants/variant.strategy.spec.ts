import { createModeStrategy } from './variant.strategy';
import { BattleRoyaleStrategy } from './battle-royale.strategy';
import { TimeAttackStrategy } from './time-attack.strategy';
import { LivesHeatsStrategy } from './lives-heats.strategy';

describe('createModeStrategy', () => {
  it('returns a BattleRoyaleStrategy for "battle_royale"', () => {
    expect(createModeStrategy('battle_royale')).toBeInstanceOf(
      BattleRoyaleStrategy,
    );
  });

  it('returns a TimeAttackStrategy for "time_attack"', () => {
    expect(createModeStrategy('time_attack')).toBeInstanceOf(
      TimeAttackStrategy,
    );
  });

  it('returns a LivesHeatsStrategy for "lives_heats"', () => {
    expect(createModeStrategy('lives_heats')).toBeInstanceOf(
      LivesHeatsStrategy,
    );
  });
});
