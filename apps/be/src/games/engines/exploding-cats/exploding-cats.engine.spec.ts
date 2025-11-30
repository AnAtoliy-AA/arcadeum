import { Test, TestingModule } from '@nestjs/testing';
import { ExplodingCatsEngine } from './exploding-cats.engine';
import { createInitialExplodingCatsState } from '../../exploding-cats/exploding-cats.state';

describe('ExplodingCatsEngine', () => {
  let engine: ExplodingCatsEngine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExplodingCatsEngine],
    }).compile();

    engine = module.get<ExplodingCatsEngine>(ExplodingCatsEngine);
  });

  it('should reset pendingDraws to 1 when turn advances after drawing a card', () => {
    const playerIds = ['p1', 'p2'];
    const state = engine.initializeState(playerIds);
    
    // Ensure deck has safe cards
    state.deck = ['skip', 'skip', 'skip', 'skip'];
    
    // Player 1 draws a card
    const result = engine.executeAction(state, 'draw_card', { userId: 'p1', roomId: 'room1' });
    expect(result.success).toBe(true);
    
    // Turn should have advanced to Player 2
    expect(result.state.currentTurnIndex).toBe(1);
    
    // Player 2 should have 1 pending draw
    expect(result.state.pendingDraws).toBe(1);
    
    // Player 2 should be able to draw
    const result2 = engine.executeAction(result.state, 'draw_card', { userId: 'p2', roomId: 'room1' });
    expect(result2.success).toBe(true);
  });

  it('should set pendingDraws to 2 when Attack is played', () => {
    const playerIds = ['p1', 'p2'];
    const state = engine.initializeState(playerIds);
    
    // Give Player 1 an Attack card
    state.players[0].hand.push('attack');
    
    // Player 1 plays Attack
    const result = engine.executeAction(state, 'play_card', { userId: 'p1', roomId: 'room1' }, { card: 'attack' });
    expect(result.success).toBe(true);
    
    // Turn should have advanced to Player 2
    expect(result.state.currentTurnIndex).toBe(1);
    
    // Player 2 should have 2 pending draws
    expect(result.state.pendingDraws).toBe(2);
  });

  it('should set pendingDraws to 1 when Skip is played', () => {
    const playerIds = ['p1', 'p2'];
    const state = engine.initializeState(playerIds);
    
    // Give Player 1 a Skip card
    state.players[0].hand.push('skip');
    
    // Player 1 plays Skip
    const result = engine.executeAction(state, 'play_card', { userId: 'p1', roomId: 'room1' }, { card: 'skip' });
    expect(result.success).toBe(true);
    
    // Turn should have advanced to Player 2
    expect(result.state.currentTurnIndex).toBe(1);
    
    // Player 2 should have 1 pending draw
    expect(result.state.pendingDraws).toBe(1);
  });
});
