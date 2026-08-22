'use client';

import { memo, useMemo } from 'react';
import type { HeartsClientState } from '../types';

interface CardProps {
  cardId: string;
  playable: boolean;
  selected: boolean;
  onClick: () => void;
}

const SUIT_SYMBOLS: Record<string, string> = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
};

const SUIT_COLORS: Record<string, string> = {
  S: 'text-slate-800',
  H: 'text-red-600',
  D: 'text-amber-500',
  C: 'text-slate-600',
};

function parseCard(cardId: string): { rank: string; suit: string } {
  const suit = cardId.slice(-1);
  const rank = cardId.slice(0, -1);
  return { rank, suit };
}

const Card = memo(function Card({
  cardId,
  playable,
  selected,
  onClick,
}: CardProps) {
  const { rank, suit } = parseCard(cardId);
  const suitSymbol = SUIT_SYMBOLS[suit] ?? '?';
  const isRed = suit === 'H' || suit === 'D';

  return (
    <button
      onClick={onClick}
      disabled={!playable}
      className={`
        relative flex flex-col items-center justify-center
        w-14 h-20 rounded-lg border-2 transition-all duration-150
        ${playable ? 'cursor-pointer hover:scale-105 hover:-translate-y-1' : 'opacity-50 cursor-not-allowed'}
        ${selected ? '-translate-y-2 border-[var(--accent)] shadow-lg' : 'border-[var(--card-border)]'}
        bg-[var(--surface)]
      `}
    >
      <span
        className={`text-xs font-bold ${isRed ? 'text-red-500' : 'text-slate-700'}`}
      >
        {rank}
      </span>
      <span className={`text-lg ${SUIT_COLORS[suit] ?? 'text-slate-700'}`}>
        {suitSymbol}
      </span>
    </button>
  );
});

interface HeartsBoardProps {
  snapshot: HeartsClientState;
  currentUserId?: string | null;
  myHand: string[];
  myTurn: boolean;
  disabled: boolean;
  members?: Array<{ id: string; name?: string }>;
  onPlayCard: (card: string) => void;
  selectedCards: string[];
  onToggleCard: (card: string) => void;
  onConfirmPass: () => void;
}

export const HeartsBoard = memo(function HeartsBoard({
  snapshot,
  myHand,
  myTurn,
  disabled,
  members,
  onPlayCard,
  selectedCards,
  onToggleCard,
  onConfirmPass,
}: HeartsBoardProps) {
  const isPassing = snapshot.phase === 'passing';

  const currentTrickCards = useMemo(() => {
    return snapshot.currentTrick.plays.map((play) => ({
      ...play,
      cardId: play.card,
    }));
  }, [snapshot.currentTrick.plays]);

  const getPlayerName = (playerId: string) => {
    return (
      members?.find((m) => m.id === playerId)?.name ?? playerId.slice(0, 8)
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="text-center text-sm text-[var(--text-secondary)]">
        {isPassing
          ? `Select 3 cards to pass ${snapshot.passDirection}`
          : `Trick ${Math.floor(snapshot.currentTrick.plays.length / 4) + 1}`}
      </div>

      <div className="flex justify-center gap-2 flex-wrap min-h-[100px] items-center">
        {currentTrickCards.length === 0 && (
          <div className="text-[var(--text-secondary)] text-sm italic">
            No cards played yet
          </div>
        )}
        {currentTrickCards.map((play, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Card
              cardId={play.cardId}
              playable={false}
              selected={false}
              onClick={() => {}}
            />
            <span className="text-xs text-[var(--text-secondary)]">
              {getPlayerName(play.playerId)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-end gap-1 pt-4 border-t border-[var(--card-border)]">
        {myHand.map((cardId) => (
          <Card
            key={cardId}
            cardId={cardId}
            playable={myTurn && !disabled}
            selected={selectedCards.includes(cardId)}
            onClick={() => {
              if (isPassing) {
                onToggleCard(cardId);
              } else {
                onPlayCard(cardId);
              }
            }}
          />
        ))}
      </div>

      {isPassing && selectedCards.length === 3 && (
        <div className="flex justify-center">
          <button
            onClick={onConfirmPass}
            className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Pass Cards
          </button>
        </div>
      )}

      <div className="flex justify-between text-sm">
        <div className="text-[var(--text-secondary)]">
          Hand {snapshot.handNumber}
        </div>
        <div className="flex gap-4">
          {snapshot.players.map((p) => (
            <div key={p.playerId} className="flex items-center gap-1">
              <span className="text-[var(--text-secondary)]">
                {getPlayerName(p.playerId)}:
              </span>
              <span className="font-medium">
                {snapshot.scores[p.playerId] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
