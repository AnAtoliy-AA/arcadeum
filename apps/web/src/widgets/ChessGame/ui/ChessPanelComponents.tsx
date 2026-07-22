'use client';

import type { ChessClientState } from '../types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

type TranslateFn = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

const KING_SYMBOLS = { white: '♔', black: '♚' } as const;

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function TurnBar({
  currentTurnColor,
  isCheck,
  isCheckmate,
  fullMoveNumber,
  t,
}: {
  currentTurnColor: 'white' | 'black';
  isCheck: boolean;
  isCheckmate: boolean;
  fullMoveNumber: number;
  t: TranslateFn;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 4px',
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'rgba(248, 250, 252, 0.8)',
        }}
      >
        {KING_SYMBOLS[currentTurnColor]} {t('games.chess_v1.status.white')}{' '}
        {t('games.chess_v1.status.toMove')}
        {isCheck && !isCheckmate
          ? ` (${t('games.chess_v1.status.check').toLowerCase()})`
          : ''}
      </span>
      <span style={{ fontSize: 12, color: 'rgba(148, 163, 184, 0.5)' }}>
        {fullMoveNumber}.
      </span>
    </div>
  );
}

export function PlayerCards({
  whiteName,
  blackName,
  currentTurnColor,
  isGameOver,
  clocks,
  timeControl,
}: {
  whiteName: string;
  blackName: string;
  currentTurnColor: 'white' | 'black';
  isGameOver: boolean;
  clocks: Record<string, { remainingSeconds: number } | null> | null;
  timeControl: { incrementSeconds: number } | null;
}) {
  return (
    <div className="player-cards-container">
      <PlayerCard
        name={whiteName}
        color="white"
        isActive={currentTurnColor === 'white' && !isGameOver}
        mainTime={
          clocks?.white ? formatClock(clocks.white.remainingSeconds) : '--:--'
        }
        incrTime={timeControl ? `+${timeControl.incrementSeconds}` : '+0'}
      />
      <PlayerCard
        name={blackName}
        color="black"
        isActive={currentTurnColor === 'black' && !isGameOver}
        mainTime={
          clocks?.black ? formatClock(clocks.black.remainingSeconds) : '--:--'
        }
        incrTime={timeControl ? `+${timeControl.incrementSeconds}` : '+0'}
      />
    </div>
  );
}

export function PlayerCard({
  name,
  color,
  isActive,
  mainTime,
  incrTime,
}: {
  name: string;
  color: 'white' | 'black';
  isActive: boolean;
  mainTime: string;
  incrTime: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 10,
        borderRadius: 10,
        backgroundColor: isActive
          ? 'rgba(34, 197, 94, 0.08)'
          : 'rgba(255, 255, 255, 0.04)',
        border: isActive
          ? '1px solid rgba(212, 175, 55, 0.6)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background:
              color === 'white'
                ? 'linear-gradient(135deg, #e2e8f0, #94a3b8)'
                : 'linear-gradient(135deg, #475569, #1e293b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            border: '2px solid rgba(255, 255, 255, 0.1)',
            flexShrink: 0,
          }}
        >
          {KING_SYMBOLS[color]}
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#f8fafc',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <div className="player-card-stat-box">
          <div className="player-card-stat-value">{mainTime}</div>
          <div className="player-card-stat-label">MAIN</div>
        </div>
        <div className="player-card-stat-box">
          <div className="player-card-stat-value">{incrTime}</div>
          <div className="player-card-stat-label">INCR</div>
        </div>
      </div>
    </div>
  );
}

export function GameInfoPanel({
  snapshot,
  t: _t,
}: {
  snapshot: ChessClientState;
  t: TranslateFn;
}) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(15, 20, 30, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: 'rgba(148, 163, 184, 0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 8,
        }}
      >
        GAME INFO
      </div>
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: 'rgba(148, 163, 184, 0.4)',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          ENGINE EVAL
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '55%',
              background: 'linear-gradient(90deg, #38bdf8, #a78bfa)',
              borderRadius: 2,
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 3,
          }}
        >
          <span style={{ fontSize: 9, color: 'rgba(148, 163, 184, 0.4)' }}>
            +0.4
          </span>
          <span style={{ fontSize: 9, color: 'rgba(148, 163, 184, 0.4)' }}>
            White
          </span>
          <span style={{ fontSize: 9, color: 'rgba(148, 163, 184, 0.4)' }}>
            Black
          </span>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <span style={{ fontSize: 11, color: 'rgba(148, 163, 184, 0.6)' }}>
          Turn
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#f8fafc',
            padding: '3px 10px',
            borderRadius: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
          }}
        >
          {KING_SYMBOLS[snapshot.currentTurnColor]}{' '}
          {snapshot.currentTurnColor === 'white' ? 'White' : 'Black'}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <span style={{ fontSize: 11, color: 'rgba(148, 163, 184, 0.6)' }}>
          Move
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc' }}>
          #{snapshot.fullMoveNumber}
        </span>
      </div>
    </div>
  );
}

export function ActionsBar({
  hasDrawOffer,
  isMyDrawOffer,
  isGameOver,
  isSpectator,
  currentUserId,
  onResign,
  onOfferDraw,
  onAcceptDraw,
  t,
}: {
  hasDrawOffer: boolean;
  isMyDrawOffer: boolean;
  isGameOver: boolean;
  isSpectator: boolean;
  currentUserId: string | null;
  onResign: () => void;
  onOfferDraw: () => void;
  onAcceptDraw: () => void;
  t: TranslateFn;
}) {
  if (!currentUserId || isGameOver || isSpectator) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(148, 163, 184, 0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        ACTIONS
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="button"
          onClick={onResign}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 6,
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            color: '#ef4444',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t('games.chess_v1.actions.resign')}
        </button>
        <button
          type="button"
          onClick={hasDrawOffer && !isMyDrawOffer ? onAcceptDraw : onOfferDraw}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 6,
            backgroundColor: 'rgba(163, 163, 38, 0.15)',
            border: '1px solid rgba(163, 163, 38, 0.3)',
            color: '#eab308',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {hasDrawOffer && !isMyDrawOffer
            ? t('games.chess_v1.actions.acceptDraw')
            : t('games.chess_v1.actions.draw')}
        </button>
      </div>
    </div>
  );
}
