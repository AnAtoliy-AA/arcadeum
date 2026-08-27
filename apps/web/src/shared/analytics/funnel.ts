// Funnel instrumentation (roadmap 6C). Solo and Social conversion paths are
// tracked as separate cohorts — distinct event names plus a `funnelPath` prop
// — so dashboards can split cold-traffic (solo play) from invite-driven
// (social play) funnels. Attribution props are attached to every funnel event.

import { track, type AnalyticsPayload } from '@/shared/lib/analytics';
import { attributionEventProps } from './attribution';

export type FunnelPath = 'solo' | 'social';

export const FUNNEL_EVENTS = {
  soloGameStarted: 'solo.game.started',
  soloGameCompleted: 'solo.game.completed',
  socialRoomCreated: 'social.room.created',
  socialQuickplayStarted: 'social.quickplay.started',
  socialMatchmakingJoined: 'social.matchmaking.joined',
  socialMatchmakingMatched: 'social.matchmaking.matched',
  socialInviteLanded: 'social.invite.landed',
  socialInviteAccepted: 'social.invite.accepted',
  socialGameCompleted: 'social.game.completed',
  inviteShared: 'invite.shared',
} as const;

function trackFunnel(
  path: FunnelPath,
  event: string,
  props: AnalyticsPayload = {},
): void {
  const payload: AnalyticsPayload = attributionEventProps();
  payload.funnelPath = path;
  for (const key of Object.keys(props)) {
    payload[key] = props[key];
  }
  track(event, payload);
}

export function trackSoloGameStarted(gameId: string): void {
  trackFunnel('solo', FUNNEL_EVENTS.soloGameStarted, { gameId });
}

/** Single chokepoint for all game completions: statsStore.recordGameResult. */
export function trackGameCompleted(
  gameId: string,
  result: 'won' | 'lost' | 'draw',
  sessionId?: string,
): void {
  const isSocial = typeof sessionId === 'string' && sessionId.length > 0;
  const event = isSocial
    ? FUNNEL_EVENTS.socialGameCompleted
    : FUNNEL_EVENTS.soloGameCompleted;
  trackFunnel(isSocial ? 'social' : 'solo', event, {
    gameId,
    result,
    ...(isSocial ? { sessionId } : {}),
  });
}

export function trackSocialRoomCreated(gameId: string): void {
  trackFunnel('social', FUNNEL_EVENTS.socialRoomCreated, { gameId });
}

export function trackSocialQuickplayStarted(
  gameId: string,
  mode: 'ai' | 'human',
): void {
  trackFunnel('social', FUNNEL_EVENTS.socialQuickplayStarted, { gameId, mode });
}

export function trackSocialMatchmakingJoined(gameId: string): void {
  trackFunnel('social', FUNNEL_EVENTS.socialMatchmakingJoined, { gameId });
}

export function trackSocialMatchmakingMatched(
  gameId: string,
  roomId: string,
): void {
  trackFunnel('social', FUNNEL_EVENTS.socialMatchmakingMatched, {
    gameId,
    roomId,
  });
}

/** Visitor opened an invite link (K-factor numerator candidate). */
export function trackSocialInviteLanded(roomId: string): void {
  trackFunnel('social', FUNNEL_EVENTS.socialInviteLanded, { roomId });
}

/** Invite link converted into a joined room. */
export function trackSocialInviteAccepted(
  roomId: string,
  gameId?: string,
): void {
  trackFunnel('social', FUNNEL_EVENTS.socialInviteAccepted, {
    roomId,
    gameId: gameId ?? null,
  });
}

export function trackInviteShared(channel: string, roomId: string): void {
  trackFunnel('social', FUNNEL_EVENTS.inviteShared, { channel, roomId });
}
