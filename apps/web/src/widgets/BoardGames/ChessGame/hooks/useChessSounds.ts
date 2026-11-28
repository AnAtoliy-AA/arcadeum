'use client';

import { useCallback, useEffect } from 'react';
import { useGameSound, gameSounds } from '@/shared/lib/game-sounds';
import type { GameSoundId } from '@/shared/lib/game-sounds';
import type { SoundType } from '../lib/sounds';
import { useSoundPreferences } from '../lib/sound-preferences';

const SOUND_MAP: Record<SoundType, GameSoundId> = {
  move: 'chess_move',
  capture: 'chess_capture',
  check: 'chess_check',
  castle: 'chess_castle',
  promotion: 'chess_promotion',
  gameStart: 'chess_game_start',
  gameEnd: 'chess_game_end',
  drawOffer: 'chess_draw_offer',
  notification: 'chess_notification',
  error: 'chess_error',
  illegal: 'chess_error',
  lowTime: 'chess_notification',
};

const MINIMAL_SOUNDS = new Set<SoundType>([
  'capture',
  'check',
  'gameEnd',
  'lowTime',
]);

export function useChessSounds() {
  const { play } = useGameSound('chess_v1');
  const { volume, soundPack } = useSoundPreferences();

  useEffect(() => {
    gameSounds.setVolume(volume);
  }, [volume]);

  const playSound = useCallback(
    (type: SoundType) => {
      if (soundPack === 'off') return;
      if (soundPack === 'minimal' && !MINIMAL_SOUNDS.has(type)) return;
      const soundId = SOUND_MAP[type];
      if (soundId) {
        play(soundId);
      }
    },
    [play, soundPack],
  );

  return { playSound };
}
