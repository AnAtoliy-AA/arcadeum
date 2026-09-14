'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  sendEmbedMessage,
  onEmbedMessage,
  isEmbedded,
} from '@/shared/lib/embedCommunication';

interface EmbedGameViewProps {
  gameId: string;
  gameName: string;
  theme?: 'dark' | 'light';
  size?: 'compact' | 'normal';
}

const GAME_ICONS: Record<string, string> = {
  tic_tac_toe_v1: '❌',
  minesweeper_v1: '💣',
  game_2048_v1: '🔢',
};

export function EmbedGameView({
  gameId,
  gameName,
  theme: initialTheme = 'dark',
  size: initialSize = 'normal',
}: EmbedGameViewProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>(initialTheme);
  const [size, setSize] = useState<'compact' | 'normal'>(initialSize);

  useEffect(() => {
    const cleanup = onEmbedMessage((msg) => {
      if (msg.theme) setTheme(msg.theme);
      if (msg.size) setSize(msg.size);
    });
    return cleanup;
  }, []);

  useEffect(() => {
    if (!isEmbedded()) return;
    sendEmbedMessage({ type: 'ready' });
  }, []);

  const _handleGameOver = useCallback(
    (result: 'won' | 'lost' | 'draw', score?: number) => {
      if (!isEmbedded()) return;
      sendEmbedMessage({ type: 'gameOver', result, score });
    },
    [],
  );

  const icon = GAME_ICONS[gameId] ?? '🎮';
  const isCompact = size === 'compact';
  const isDark = theme === 'dark';

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        isCompact ? 'p-2' : 'p-4'
      } ${isDark ? 'bg-[#070b14]' : 'bg-white'}`}
      style={{ minHeight: isCompact ? '300px' : '400px' }}
    >
      {/* Embed header */}
      <div
        className={`mb-3 flex items-center gap-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        <span className={isCompact ? 'text-lg' : 'text-2xl'}>{icon}</span>
        <span className={`font-bold ${isCompact ? 'text-sm' : 'text-lg'}`}>
          {gameName}
        </span>
      </div>

      {/* Game placeholder — in production this would load the actual game widget */}
      <div
        className={`flex flex-col items-center justify-center rounded-xl border ${
          isDark
            ? 'border-white/10 bg-white/5 text-white'
            : 'border-gray-200 bg-gray-50 text-gray-900'
        } ${isCompact ? 'h-[250px] w-[250px]' : 'h-[350px] w-[350px]'}`}
      >
        <span className="mb-2 text-4xl">{icon}</span>
        <p className="text-sm opacity-70">Game loading...</p>
        <p className="mt-2 text-xs opacity-50">
          Play the full version at arcadeum.games
        </p>
      </div>

      {/* Arcadeum branding */}
      <a
        href={`https://arcadeum.games/games/${gameId.replace(/_v\d+$/, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-3 text-xs font-semibold opacity-50 hover:opacity-100 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        arcadeum.games
      </a>
    </div>
  );
}
