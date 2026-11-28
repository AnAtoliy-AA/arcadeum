import type { ArcadePetCollectionService } from './arcade-pet-collection.service';
import type { ArcadePetFeatureService } from './arcade-pet-feature.service';
import { ArcadePetTreatRewardService } from './arcade-pet-treat-reward.service';

describe('ArcadePetTreatRewardService', () => {
  const awardTreat = jest.fn();
  const isEnabledFor = jest.fn();
  const service = new ArcadePetTreatRewardService(
    { awardTreat } as unknown as ArcadePetCollectionService,
    { isEnabledFor } as unknown as ArcadePetFeatureService,
  );

  beforeEach(() => {
    jest.resetAllMocks();
    isEnabledFor.mockResolvedValue(true);
    awardTreat.mockResolvedValue('awarded');
  });

  it('awards the game treat to every human winner, keyed by session', async () => {
    await service.awardWinTreats('chess_v1', ['u1', 'u2'], 's1');
    expect(awardTreat).toHaveBeenCalledTimes(2);
    expect(awardTreat).toHaveBeenCalledWith('u1', 'chess_cookie', 'treat:s1');
    expect(awardTreat).toHaveBeenCalledWith('u2', 'chess_cookie', 'treat:s1');
  });

  it.each(['go_v1', 'arcade_pet_v1', 'unknown_v1'])(
    'awards nothing for %s',
    async (gameId) => {
      await service.awardWinTreats(gameId, ['u1'], 's1');
      expect(awardTreat).not.toHaveBeenCalled();
    },
  );

  it('skips bots, anonymous players and sessions without an id', async () => {
    await service.awardWinTreats('chess_v1', ['bot-1', 'anon_x'], 's1');
    await service.awardWinTreats('chess_v1', ['u1'], undefined);
    expect(awardTreat).not.toHaveBeenCalled();
  });

  it('awards nothing while the feature flag is off for the player', async () => {
    isEnabledFor.mockResolvedValue(false);
    await service.awardWinTreats('chess_v1', ['u1'], 's1');
    expect(awardTreat).not.toHaveBeenCalled();
  });

  it('keeps rewarding other winners when one award fails', async () => {
    awardTreat.mockRejectedValueOnce(new Error('db down'));
    await service.awardWinTreats('hearts_v1', ['u1', 'u2'], 's1');
    expect(awardTreat).toHaveBeenCalledTimes(2);
  });
});
