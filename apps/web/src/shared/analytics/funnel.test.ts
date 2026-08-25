import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setAnalyticsDispatcher } from '@/shared/lib/analytics';
import {
  FUNNEL_EVENTS,
  trackSoloGameStarted,
  trackGameCompleted,
  trackSocialRoomCreated,
  trackSocialQuickplayStarted,
  trackSocialMatchmakingJoined,
  trackSocialMatchmakingMatched,
  trackSocialInviteLanded,
  trackSocialInviteAccepted,
  trackInviteShared,
} from './funnel';

vi.mock('./attribution', () => ({
  attributionEventProps: () => ({
    attributionSource: 'test',
    attributionCampaign: null,
    attributionFirstSource: 'test',
  }),
}));

function captureDispatch(): Array<{
  event: string;
  props: Record<string, unknown>;
}> {
  const calls: Array<{ event: string; props: Record<string, unknown> }> = [];
  setAnalyticsDispatcher((event, props) => {
    calls.push({ event, props });
  });
  return calls;
}

describe('funnel event helpers', () => {
  beforeEach(() => {
    setAnalyticsDispatcher(null);
  });

  it('tracks solo game starts with the solo cohort path', () => {
    const dispatch = captureDispatch();
    trackSoloGameStarted('solitaire_v1');
    expect(dispatch).toEqual([
      {
        event: FUNNEL_EVENTS.soloGameStarted,
        props: {
          funnelPath: 'solo',
          gameId: 'solitaire_v1',
          attributionSource: 'test',
          attributionCampaign: null,
          attributionFirstSource: 'test',
        },
      },
    ]);
  });

  it('routes completions with a sessionId to the social cohort', () => {
    const dispatch = captureDispatch();
    trackGameCompleted('chess_v1', 'won', 'session-123');
    expect(dispatch[0].event).toBe(FUNNEL_EVENTS.socialGameCompleted);
    expect(dispatch[0].props).toMatchObject({
      funnelPath: 'social',
      gameId: 'chess_v1',
      result: 'won',
      sessionId: 'session-123',
    });
  });

  it('routes completions without a sessionId to the solo cohort', () => {
    const dispatch = captureDispatch();
    trackGameCompleted('sudoku_v1', 'lost');
    expect(dispatch[0].event).toBe(FUNNEL_EVENTS.soloGameCompleted);
    expect(dispatch[0].props).toMatchObject({
      funnelPath: 'solo',
      result: 'lost',
    });
  });

  it('treats an empty sessionId as solo play', () => {
    const dispatch = captureDispatch();
    trackGameCompleted('minesweeper_v1', 'won', '');
    expect(dispatch[0].event).toBe(FUNNEL_EVENTS.soloGameCompleted);
  });

  it('covers every social entry point with distinct events', () => {
    const dispatch = captureDispatch();

    trackSocialRoomCreated('chess_v1');
    trackSocialQuickplayStarted('checkers_v1', 'ai');
    trackSocialMatchmakingJoined('go_v1');
    trackSocialMatchmakingMatched('go_v1', 'room-1');
    trackSocialInviteLanded('room-2');
    trackSocialInviteAccepted('room-2', 'hearts_v1');

    expect(dispatch.map((c) => c.event)).toEqual([
      FUNNEL_EVENTS.socialRoomCreated,
      FUNNEL_EVENTS.socialQuickplayStarted,
      FUNNEL_EVENTS.socialMatchmakingJoined,
      FUNNEL_EVENTS.socialMatchmakingMatched,
      FUNNEL_EVENTS.socialInviteLanded,
      FUNNEL_EVENTS.socialInviteAccepted,
    ]);
    for (const call of dispatch) {
      expect(call.props.funnelPath).toBe('social');
    }
    // Invite accepted without a known game still records the room.
    trackSocialInviteAccepted('room-3');
    expect(dispatch.at(-1)?.props.gameId).toBeNull();
  });

  it('records invite share channels', () => {
    const dispatch = captureDispatch();
    trackInviteShared('telegram', 'room-9');
    expect(dispatch).toEqual([
      {
        event: FUNNEL_EVENTS.inviteShared,
        props: {
          funnelPath: 'social',
          channel: 'telegram',
          roomId: 'room-9',
          attributionSource: 'test',
          attributionCampaign: null,
          attributionFirstSource: 'test',
        },
      },
    ]);
  });
});
