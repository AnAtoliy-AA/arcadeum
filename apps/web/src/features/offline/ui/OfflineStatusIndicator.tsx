import React from 'react';

interface OfflineStatusIndicatorProps {
  isOnline: boolean;
  cachedGamesCount: number;
  onPlayOfflineClick?: () => void;
}

export const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = ({
  isOnline,
  cachedGamesCount,
  onPlayOfflineClick,
}) => {
  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-center justify-between gap-4 animate-in fade-in"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">📡</span>
        <div>
          <h4 className="text-sm font-bold text-amber-300">
            Offline Mode Active
          </h4>
          <p className="text-xs text-[var(--mutedForeground)]">
            {cachedGamesCount > 0
              ? `${cachedGamesCount} game(s) available to play offline against AI`
              : 'You are currently disconnected'}
          </p>
        </div>
      </div>

      {cachedGamesCount > 0 && onPlayOfflineClick && (
        <button
          onClick={onPlayOfflineClick}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors shrink-0"
        >
          Play Offline
        </button>
      )}
    </div>
  );
};
