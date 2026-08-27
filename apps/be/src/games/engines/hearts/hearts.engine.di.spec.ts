import { Test } from '@nestjs/testing';
import { GameEnginesModule } from '../engines.module';
import { HeartsEngine } from './hearts.engine';

describe('HeartsEngine DI', () => {
  it('resolves via Nest DI without an explicit shuffler provider', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GameEnginesModule],
    }).compile();
    const engine = moduleRef.get(HeartsEngine);
    expect(engine.getMetadata().gameId).toBe('hearts_v1');

    moduleRef.get(GameEnginesModule).onModuleInit();
    const state = engine.initializeState(['a', 'b', 'c', 'd']);
    for (const hand of Object.values(state.hands)) {
      expect(hand).toHaveLength(13);
    }
  });
});
