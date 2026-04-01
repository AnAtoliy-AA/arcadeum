import {
  createInitialCriticalState,
  CriticalState,
} from '../../critical/critical.state';
import { executeChainStrike, executeShieldBash } from './critical-attack.utils';

const makeHelpers = () => ({
  addLog: jest.fn(),
  createLogEntry: jest.fn().mockReturnValue({
    id: '1',
    type: 'action',
    message: '',
    createdAt: new Date().toISOString(),
  }),
  advanceTurn: jest.fn(),
});

describe('executeChainStrike', () => {
  let state: CriticalState;

  beforeEach(() => {
    state = createInitialCriticalState(['p1', 'p2', 'p3'], ['attack']);
    state.players.forEach((p) => (p.hand = []));
    state.players.find((p) => p.playerId === 'p1')!.hand = ['chain_strike'];
  });

  it('moves turn to first target with pendingDraws=1 and stores chainTargetId', () => {
    const result = executeChainStrike(state, 'p1', 'p2', makeHelpers());

    expect(result.success).toBe(true);
    const s = result.state!;
    expect(s.currentTurnIndex).toBe(s.playerOrder.indexOf('p2'));
    expect(s.pendingDraws).toBe(1);
    expect(
      (s.pendingAction?.payload as Record<string, unknown>)?.chainTargetId,
    ).toBe('p3');
    expect(s.discardPile).toContain('chain_strike');
    expect(s.players.find((p) => p.playerId === 'p1')!.hand).not.toContain(
      'chain_strike',
    );
  });

  it('stacks with existing pendingDraws on the first target', () => {
    state.pendingDraws = 2;
    const result = executeChainStrike(state, 'p1', 'p2', makeHelpers());

    expect(result.success).toBe(true);
    expect(result.state!.pendingDraws).toBe(3);
  });

  it('fails if target player is dead', () => {
    state.players.find((p) => p.playerId === 'p2')!.alive = false;
    const result = executeChainStrike(state, 'p1', 'p2', makeHelpers());
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('fails if player does not have chain_strike in hand', () => {
    state.players.find((p) => p.playerId === 'p1')!.hand = [];
    const result = executeChainStrike(state, 'p1', 'p2', makeHelpers());
    expect(result.success).toBe(false);
  });
});

describe('executeShieldBash', () => {
  let state: CriticalState;

  beforeEach(() => {
    state = createInitialCriticalState(['p1', 'p2'], ['attack']);
    state.players.forEach((p) => (p.hand = []));
  });

  it('reflects incoming strike draws onto the attacker and clears pendingAction', () => {
    state.players.find((p) => p.playerId === 'p2')!.hand = ['shield_bash'];
    state.currentTurnIndex = state.playerOrder.indexOf('p2');
    state.pendingDraws = 2;
    state.pendingAction = {
      type: 'targeted_strike',
      playerId: 'p1',
      payload: { targetPlayerId: 'p2' },
      nopeCount: 0,
    };

    const result = executeShieldBash(state, 'p2', makeHelpers());

    expect(result.success).toBe(true);
    const s = result.state!;
    expect(s.currentTurnIndex).toBe(s.playerOrder.indexOf('p1'));
    expect(s.pendingDraws).toBe(2);
    expect(s.pendingAction).toBeNull();
    expect(s.discardPile).toContain('shield_bash');
  });

  it('fails if no pending strike is targeting the player', () => {
    state.players.find((p) => p.playerId === 'p2')!.hand = ['shield_bash'];
    state.pendingAction = null;

    const result = executeShieldBash(state, 'p2', makeHelpers());
    expect(result.success).toBe(false);
  });

  it('fails if pending action targets a different player', () => {
    state.players.find((p) => p.playerId === 'p2')!.hand = ['shield_bash'];
    state.pendingAction = {
      type: 'targeted_strike',
      playerId: 'p1',
      payload: { targetPlayerId: 'p1' },
      nopeCount: 0,
    };

    const result = executeShieldBash(state, 'p2', makeHelpers());
    expect(result.success).toBe(false);
  });
});
