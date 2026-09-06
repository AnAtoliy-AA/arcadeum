'use client';

import { useState } from 'react';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { TimeControl } from '@/widgets/BoardGames/ChessGame/types';
import { TIME_CONTROLS } from '@/widgets/BoardGames/ChessGame/types';

interface ChallengeButtonProps {
  targetUserId: string;
  onChallengeSent?: () => void;
}

export function ChallengeButton({ targetUserId, onChallengeSent }: ChallengeButtonProps) {
  const { t } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChallenge = async (tc: TimeControl | null) => {
    setSending(true);
    try {
      const res = await fetch('/api/chess/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, timeControl: tc }),
      });
      if (res.ok) {
        setShowPicker(false);
        onChallengeSent?.();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="primary"
        size="sm"
        onClick={() => setShowPicker(!showPicker)}
        disabled={sending}
      >
        {t('games.chess_v1.profile.challenge')}
      </Button>

      {showPicker && (
        <div className="absolute right-0 top-full z-20 mt-1 rounded-lg border border-[var(--glassBorder)] bg-[var(--glassBg)] p-2 shadow-lg">
          {TIME_CONTROLS.map((tc) => (
            <button
              key={`${tc.initialSeconds}-${tc.incrementSeconds}`}
              onClick={() => handleChallenge(tc)}
              className="block w-full rounded px-3 py-1 text-left text-sm text-[var(--color)] hover:bg-[var(--glassBgHover)]"
            >
              {tc.initialSeconds / 60}+{tc.incrementSeconds}
            </button>
          ))}
          <button
            onClick={() => handleChallenge(null)}
            className="block w-full rounded px-3 py-1 text-left text-sm text-[var(--color)] hover:bg-[var(--glassBgHover)]"
          >
            {t('games.chess_v1.lobby.noClock')}
          </button>
        </div>
      )}
    </div>
  );
}
