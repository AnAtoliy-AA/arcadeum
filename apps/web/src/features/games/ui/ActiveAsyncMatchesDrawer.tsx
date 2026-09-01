import React from 'react';
import {
  formatTurnTimeRemaining,
  getTurnTimeRemaining,
  getTurnUrgency,
  isMyTurn,
  type AsyncMatchItem,
} from '@/shared/lib/async-match';

interface ActiveAsyncMatchesDrawerProps {
  matches: AsyncMatchItem[];
  currentUserId: string;
  onSelectMatch: (matchId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ActiveAsyncMatchesDrawer: React.FC<
  ActiveAsyncMatchesDrawerProps
> = ({ matches, currentUserId, onSelectMatch, isOpen, onClose }) => {
  if (!isOpen) return null;

  const activeMatches = matches.filter((m) => m.status === 'active');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="async-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity"
    >
      <div className="w-full max-w-md h-full bg-[var(--background)] border-l border-[var(--glassBorder)] p-6 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--glassBorder)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">⏳</span>
            <h2
              id="async-drawer-title"
              className="text-lg font-bold text-[var(--foreground)]"
            >
              Active Turn-Based Matches
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-[var(--mutedForeground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--surfaceHover)] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {activeMatches.length === 0 ? (
            <div className="text-center py-12 text-[var(--mutedForeground)]">
              <p className="text-sm">No active async matches found.</p>
            </div>
          ) : (
            activeMatches.map((match) => {
              const myTurn = isMyTurn(match, currentUserId);
              const remainingMs = getTurnTimeRemaining(match.turnExpiresAt);
              const urgency = getTurnUrgency(remainingMs);
              const opponent =
                match.playerA === currentUserId ? match.playerB : match.playerA;

              const urgencyBadgeClass =
                urgency === 'critical'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : urgency === 'warning'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

              return (
                <div
                  key={match.matchId}
                  className="p-4 rounded-xl bg-[var(--card)] border border-[var(--cardBorder)] hover:border-[var(--primary)] transition-all flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm capitalize text-[var(--foreground)]">
                      {match.gameType}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${urgencyBadgeClass}`}
                    >
                      {formatTurnTimeRemaining(remainingMs)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--mutedForeground)]">
                    <span>vs {opponent}</span>
                    <span
                      className={`font-semibold ${
                        myTurn
                          ? 'text-[var(--primary)]'
                          : 'text-[var(--mutedForeground)]'
                      }`}
                    >
                      {myTurn ? '👉 Your Turn' : '⏳ Waiting on opponent'}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectMatch(match.matchId)}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-[var(--primary)] text-[var(--primaryForeground)] hover:opacity-90 transition-opacity"
                  >
                    Resume Match
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
