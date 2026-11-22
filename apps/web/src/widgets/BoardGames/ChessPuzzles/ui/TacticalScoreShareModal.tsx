'use client';

import { useState, useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
  GlassCard,
} from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';

export interface TacticalScoreShareModalProps {
  open: boolean;
  onClose: () => void;
  gameMode: 'survival' | 'timed' | 'daily';
  score: number;
  bestStreak: number;
  totalTimeSeconds: number;
  rating?: number;
  streakMultiplier?: number;
  locale?: string;
}

export function TacticalScoreShareModal({
  open,
  onClose,
  gameMode,
  score,
  bestStreak,
  totalTimeSeconds,
  rating = 1200,
  streakMultiplier = 1.0,
  locale = 'en',
}: TacticalScoreShareModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const modeLabel =
    gameMode === 'survival'
      ? t('games.chess_v1.puzzleRush.survival')
      : gameMode === 'timed'
        ? t('games.chess_v1.puzzleRush.timed')
        : t('games.chess_v1.puzzleRush.dailyModeTitle');

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://arcadeum.games/${locale}/games/chess/puzzles/rush`;

  const shareText = [
    `♟️ Arcadeum Chess Tactics`,
    `Mode: ${modeLabel}`,
    `Score: ${score} Solved | Best Streak: ${bestStreak}`,
    `Time: ${totalTimeSeconds}s | Tactical Rating: ${rating}`,
    streakMultiplier > 1.0 ? `🔥 Streak Multiplier: ${streakMultiplier}x` : '',
    `Play: ${shareUrl}`,
  ]
    .filter(Boolean)
    .join('\n');

  const handleCopy = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      });
    }
  }, [shareText]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Arcadeum Chess Tactical Brag Card',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  }, [shareText, shareUrl, handleCopy]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent
        data-testid="tactical-share-modal"
        className="max-w-md bg-[var(--backgroundModal)] border border-[var(--glassBorder)] p-6 rounded-2xl"
      >
        <ModalHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span>⚡</span> Tactical Score Card
            </span>
          </div>
          <ModalTitle className="text-2xl font-black text-[var(--color)]">
            Tactical Performance
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="flex flex-col gap-4 py-2">
          <GlassCard className="p-4 rounded-xl border border-[var(--glassBorder)] bg-gradient-to-b from-[var(--glassBg)] to-[var(--backgroundHover)] flex flex-col items-center">
            <div className="text-xs uppercase tracking-wider text-[var(--textSecondary)] font-semibold mb-1">
              {modeLabel}
            </div>
            <div
              data-testid="tactical-share-score"
              className="text-5xl font-black text-[var(--color)] tracking-tight mb-2"
            >
              {score}
            </div>
            <div className="text-xs text-[var(--textSecondary)] mb-4">
              Puzzles Solved
            </div>

            <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-[var(--glassBorder)] text-center">
              <div className="flex flex-col">
                <span className="text-xs text-[var(--textSecondary)]">
                  Streak
                </span>
                <span
                  data-testid="tactical-share-streak"
                  className="text-base font-bold text-amber-400"
                >
                  🔥 {bestStreak}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-[var(--textSecondary)]">
                  Time
                </span>
                <span className="text-base font-bold text-sky-400">
                  ⏱️ {totalTimeSeconds}s
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-[var(--textSecondary)]">
                  Rating
                </span>
                <span className="text-base font-bold text-purple-400">
                  🎯 {rating}
                </span>
              </div>
            </div>

            {streakMultiplier > 1.0 && (
              <div
                data-testid="tactical-share-multiplier"
                className="mt-3 w-full py-1.5 px-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between"
              >
                <span>Active Streak Multiplier</span>
                <span className="font-bold">{streakMultiplier}x XP Bonus</span>
              </div>
            )}
          </GlassCard>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-[var(--textSecondary)] font-semibold">
              Share Preview
            </span>
            <div
              data-testid="tactical-share-preview-text"
              className="p-3 rounded-lg bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-xs text-[var(--color)] font-mono whitespace-pre-line select-all"
            >
              {shareText}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleNativeShare}
            data-testid="tactical-share-native-btn"
            className="w-full flex items-center justify-center gap-2"
          >
            <span>🚀</span> Share Brag Card
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={handleCopy}
            data-testid="tactical-share-copy-btn"
            className={cx('w-full', copied && 'border-emerald-500/50')}
          >
            {copied ? 'Copied to Clipboard! ✓' : '📋 Copy Text'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
