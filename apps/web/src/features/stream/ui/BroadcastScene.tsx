'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createElement } from 'react';
import { gameMetadata } from '@/features/games/registry';
import type { BaseGameWidgetProps } from '@/features/games';
import type { GameSessionSummary } from '@/shared/types/games';
import { useStreamRoom } from '../hooks/useStreamRoom';
import { useStreamGameWidget } from '../hooks/useStreamGameWidget';
import { buildOverlayModel } from '../lib/overlayModel';
import { getStreamJoinUrl } from '../lib/streamConfig';
import type { OverlayOptions } from '../lib/streamConfig';
import { BoardStage } from './BoardStage';
import { BroadcastOverlay } from './BroadcastOverlay';
import { StreamFrame } from './StreamFrame';
import { StreamGlobalStyles } from './StreamGlobalStyles';

const NOOP = () => {};

function titleFor(gameId: string | undefined): string {
  if (!gameId) return '';
  const meta = (gameMetadata as Record<string, { name: string } | undefined>)[
    gameId
  ];
  return meta?.name ?? '';
}

/**
 * Game scene: `/{locale}/stream/{roomId}`.
 *
 * Spectates one room and draws the board with the broadcast overlay. It is
 * deliberately error-free for viewers: until data arrives it shows the bare
 * frame, and if the socket drops it keeps the last state on screen while the
 * watchdog reconnects. Diagnostics are only shown with `?debug=1`.
 */
export function BroadcastScene({
  roomId,
  debug,
  overlay,
}: {
  roomId: string;
  debug: boolean;
  overlay?: OverlayOptions;
}) {
  const { room, session, storeSession, isConnected, viewerId } =
    useStreamRoom(roomId);
  const Widget = useStreamGameWidget(room?.gameId);
  const joinUrl = useMemo(
    () => overlay?.joinUrl ?? getStreamJoinUrl(),
    [overlay?.joinUrl],
  );

  const model = useMemo(
    () => buildOverlayModel(room, session),
    [room, session],
  );

  // Remember when the position last changed (for the move timer) and how
  // many updates we have seen (diagnostics). Adjusted during render so the
  // timer never lags a frame behind the board.
  const [lastChangeAt, setLastChangeAt] = useState(() => Date.now());
  const [updates, setUpdates] = useState(0);
  const tokenRef = useRef<string | null>(null);
  const token = model?.progressToken ?? null;
  useEffect(() => {
    if (token === null || token === tokenRef.current) return;
    tokenRef.current = token;
    setLastChangeAt(Date.now());
    setUpdates((n) => n + 1);
  }, [token]);

  const widgetProps = useMemo<BaseGameWidgetProps | null>(() => {
    if (!room || !viewerId) return null;
    return {
      roomId: room.id,
      room,
      session: storeSession as GameSessionSummary | null,
      currentUserId: viewerId,
      isHost: false,
      accessToken: null,
      showRulesOpen: false,
      onShowRulesClose: NOOP,
      isFullscreen: false,
      toggleFullscreen: NOOP,
    };
  }, [room, storeSession, viewerId]);

  const debugInfo = debug ? { connected: isConnected, roomId, updates } : null;

  return (
    <StreamFrame>
      <StreamGlobalStyles />
      <BroadcastOverlay
        title={titleFor(room?.gameId)}
        model={model}
        joinUrl={joinUrl}
        overlay={overlay}
        lastChangeAt={lastChangeAt}
        debug={debugInfo}
      >
        {room && Widget && widgetProps ? (
          <BoardStage gameId={room.gameId} roomKey={room.id}>
            {createElement(Widget, widgetProps)}
          </BoardStage>
        ) : null}
      </BroadcastOverlay>
    </StreamFrame>
  );
}
