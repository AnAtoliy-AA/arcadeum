import { Test } from '@nestjs/testing';
import { GameEnginesModule } from '../engines.module';
import { BackgammonEngine } from './backgammon.engine';

describe('BackgammonEngine DI', () => {
  it('resolves via Nest DI without an explicit dice-roller provider', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GameEnginesModule],
    }).compile();
    const engine = moduleRef.get(BackgammonEngine);
    expect(engine.getMetadata().gameId).toBe('backgammon_v1');
  });
});
