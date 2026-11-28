import {
  buildMatchEvent,
  deriveEndReason,
  deriveScore,
  isStreakMilestone,
} from './activity-feed.match';

const ALICE = '64b7f0c2a1b2c3d4e5f60001';
const BOB = '64b7f0c2a1b2c3d4e5f60002';
const CAROL = '64b7f0c2a1b2c3d4e5f60003';

describe('buildMatchEvent', () => {
  it('records a single win from the winner perspective', () => {
    const event = buildMatchEvent({
      playerIds: [ALICE, BOB],
      winners: [BOB],
      gameId: 'sea_battle_v1',
    });
    expect(event).toEqual({
      userId: BOB,
      gameId: 'sea_battle_v1',
      metadata: { result: 'win', opponentIds: [ALICE] },
    });
  });

  it('records a draw with every other player as an opponent', () => {
    const event = buildMatchEvent({
      playerIds: [ALICE, BOB],
      winners: [],
      gameId: 'chess_v1',
    });
    expect(event?.metadata).toEqual({ result: 'draw', opponentIds: [BOB] });
    expect(event?.userId).toBe(ALICE);
  });

  it('records a loss when only a bot won', () => {
    const event = buildMatchEvent({
      playerIds: [ALICE, 'bot-easy-1'],
      winners: ['bot-easy-1'],
      gameId: 'checkers_v1',
    });
    expect(event?.userId).toBe(ALICE);
    expect(event?.metadata.result).toBe('loss');
    expect(event?.metadata.opponentIds).toEqual(['bot-easy-1']);
  });

  it('returns null for bot-only matches', () => {
    expect(
      buildMatchEvent({
        playerIds: ['bot-a', 'bot-b'],
        winners: ['bot-a'],
        gameId: 'chess_v1',
      }),
    ).toBeNull();
  });

  it('prefers a registered winner over a guest winner and lists teammates', () => {
    const event = buildMatchEvent({
      playerIds: ['guest_abc', ALICE, BOB, CAROL],
      winners: ['guest_abc', ALICE],
      gameId: 'spades_v1',
    });
    expect(event?.userId).toBe(ALICE);
    expect(event?.metadata.teammateIds).toEqual(['guest_abc']);
    expect(event?.metadata.opponentIds).toEqual([BOB, CAROL]);
  });

  it('adds end reason, score, rating delta and replay id when known', () => {
    const event = buildMatchEvent({
      playerIds: [ALICE, BOB],
      winners: [ALICE],
      gameId: 'chess_v1',
      replayId: 'rp-1',
      state: {
        endReason: 'timeout',
        players: [
          { playerId: ALICE, score: 3 },
          { playerId: BOB, score: 1 },
        ],
        gameResult: { ratingDeltas: { [ALICE]: 11.6, [BOB]: -12 } },
      },
    });
    expect(event?.metadata).toEqual({
      result: 'win',
      opponentIds: [BOB],
      endReason: 'timeout',
      score: { actor: 3, opponents: [1] },
      ratingDelta: 12,
      replayId: 'rp-1',
    });
  });

  it('never marks a draw as forfeit or timeout', () => {
    const event = buildMatchEvent({
      playerIds: [ALICE, BOB],
      winners: [],
      gameId: 'chess_v1',
      state: { endReason: 'timeout' },
    });
    expect(event?.metadata.endReason).toBeUndefined();
  });
});

describe('deriveEndReason', () => {
  it('maps chess resignation to forfeit', () => {
    expect(deriveEndReason({ endReason: 'resignation' })).toBe('forfeit');
  });

  it('ignores other chess end reasons', () => {
    expect(deriveEndReason({ endReason: 'checkmate' })).toBeUndefined();
  });

  it('reads the last action log kind', () => {
    expect(
      deriveEndReason({
        logs: [
          { type: 'action', kind: 'move' },
          { type: 'system', kind: 'info' },
          { type: 'action', kind: 'forfeit' },
          { type: 'system' },
        ],
      }),
    ).toBe('forfeit');
    expect(
      deriveEndReason({ logs: [{ type: 'action', kind: 'move' }] }),
    ).toBeUndefined();
  });
});

describe('deriveScore', () => {
  it('returns undefined when an opponent has no score', () => {
    expect(
      deriveScore({ players: [{ playerId: ALICE, score: 2 }] }, ALICE, [BOB]),
    ).toBeUndefined();
  });
});

describe('isStreakMilestone', () => {
  it('only fires on milestone streaks', () => {
    expect(isStreakMilestone(3)).toBe(true);
    expect(isStreakMilestone(4)).toBe(false);
    expect(isStreakMilestone(10)).toBe(true);
  });
});
