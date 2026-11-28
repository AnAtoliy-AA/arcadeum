import { describe, expect, it } from 'vitest';
import type {
  ActivityFeedActor,
  ActivityFeedItem,
} from '@/shared/api/activity';
import {
  GROUP_WINDOW_MS,
  groupActivity,
  mergeOlder,
  newItemsSince,
} from './groupActivity';

const T0 = Date.UTC(2026, 10, 28, 12, 0, 0);

const user = (id: string): ActivityFeedActor => ({
  kind: 'user',
  name: id,
  profileId: id,
  avatarId: null,
  frameId: null,
  role: null,
});
const guest: ActivityFeedActor = {
  ...user('x'),
  kind: 'guest',
  name: null,
  profileId: null,
};

function item(
  id: string,
  minutesAgo: number,
  over: Partial<ActivityFeedItem> = {},
): ActivityFeedItem {
  return {
    id,
    type: 'game_completed',
    timestamp: new Date(T0 - minutesAgo * 60_000).toISOString(),
    gameId: 'sea_battle_v1',
    actor: user('anatoli'),
    opponents: [],
    teammates: [],
    result: 'win',
    endReason: null,
    score: null,
    ratingDelta: null,
    replayId: null,
    achievement: null,
    level: null,
    streak: null,
    tournament: null,
    ...over,
  };
}

describe('groupActivity', () => {
  it('groups consecutive wins by the same player in the same game', () => {
    const entries = groupActivity([
      item('a', 0),
      item('b', 5),
      item('c', 10),
      item('d', 15, { gameId: 'chess_v1' }),
    ]);
    expect(entries.map((e) => e.kind)).toEqual(['group', 'single']);
    expect(entries[0].kind === 'group' && entries[0].items).toHaveLength(3);
  });

  it('does not merge different results, players or event types', () => {
    const entries = groupActivity([
      item('a', 0),
      item('b', 1, { result: 'draw' }),
      item('c', 2, { actor: user('bob') }),
      item('d', 3, { type: 'level_up', result: null, level: 4 }),
      item('e', 4, { type: 'level_up', result: null, level: 5 }),
    ]);
    expect(entries.every((e) => e.kind === 'single')).toBe(true);
  });

  it('never groups guests, who may be different people', () => {
    const entries = groupActivity([
      item('a', 0, { actor: guest }),
      item('b', 1, { actor: guest }),
    ]);
    expect(entries).toHaveLength(2);
  });

  it('splits runs that span more than the window', () => {
    const windowMin = GROUP_WINDOW_MS / 60_000;
    const entries = groupActivity([
      item('a', 0),
      item('b', 10),
      item('c', windowMin + 5),
    ]);
    expect(entries.map((e) => e.kind)).toEqual(['group', 'single']);
  });

  it('returns an empty list for no items', () => {
    expect(groupActivity([])).toEqual([]);
  });
});

describe('newItemsSince / mergeOlder', () => {
  it('finds only unseen items', () => {
    expect(
      newItemsSince([item('a', 0)], [item('b', 0), item('a', 0)]).map(
        (i) => i.id,
      ),
    ).toEqual(['b']);
  });

  it('appends older pages without duplicates', () => {
    const merged = mergeOlder(
      [item('a', 0), item('b', 1)],
      [item('b', 1), item('c', 2)],
    );
    expect(merged.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });
});
