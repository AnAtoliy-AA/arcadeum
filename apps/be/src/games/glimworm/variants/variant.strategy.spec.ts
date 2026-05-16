import { createVariantStrategy } from './variant.strategy';
import { BattleRoyaleStrategy } from './battle-royale.strategy';
import { TimeAttackStrategy } from './time-attack.strategy';
import { LivesHeatsStrategy } from './lives-heats.strategy';

describe('createVariantStrategy', () => {
  it('returns a BattleRoyaleStrategy for "battle_royale"', () => {
    expect(createVariantStrategy('battle_royale')).toBeInstanceOf(
      BattleRoyaleStrategy,
    );
  });

  it('returns a TimeAttackStrategy for "time_attack"', () => {
    expect(createVariantStrategy('time_attack')).toBeInstanceOf(
      TimeAttackStrategy,
    );
  });

  it('returns a LivesHeatsStrategy for "lives_heats"', () => {
    expect(createVariantStrategy('lives_heats')).toBeInstanceOf(
      LivesHeatsStrategy,
    );
  });
});
