'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { Button } from '@arcadeum/ui';
import type { TranslationKey } from '@/shared/i18n/useTranslation';

interface ChessGameActionsProps {
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  hasDrawOffer: boolean;
  isMyDrawOffer: boolean;
  hasTakebackOffer: boolean;
  isMyTakebackOffer: boolean;
  /** Abort is only offered before both sides have moved. */
  canAbort: boolean;
  onOfferDraw: () => void;
  onAcceptDraw: () => void;
  onDeclineDraw?: () => void;
  onResign: () => void;
  onAbort?: () => void;
  onOfferTakeback: () => void;
  onAcceptTakeback: () => void;
  onDeclineTakeback: () => void;
}

/**
 * In-game action bar: takeback/draw/resign plus incoming offers. Resigning
 * (and aborting) needs a second confirming tap so a stray click on a phone
 * never throws a game away.
 */
function ChessGameActionsImpl({
  t,
  hasDrawOffer,
  isMyDrawOffer,
  hasTakebackOffer,
  isMyTakebackOffer,
  canAbort,
  onOfferDraw,
  onAcceptDraw,
  onDeclineDraw,
  onResign,
  onAbort,
  onOfferTakeback,
  onAcceptTakeback,
  onDeclineTakeback,
}: ChessGameActionsProps) {
  const [confirming, setConfirming] = useState<'resign' | 'abort' | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!confirming) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirming(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirming]);

  const showAbort = canAbort && !!onAbort;

  if (confirming) {
    const isResign = confirming === 'resign';
    return (
      <div
        role="alertdialog"
        aria-labelledby="chess-confirm-title"
        className="flex flex-col gap-2"
      >
        <p
          id="chess-confirm-title"
          className="text-xs font-semibold text-center text-[var(--color)]"
        >
          {t(
            isResign
              ? 'games.chess_v1.controls.confirmResign'
              : 'games.chess_v1.controls.confirmAbort',
          )}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="primary"
            size="sm"
            ref={confirmRef}
            onClick={() => {
              setConfirming(null);
              if (isResign) onResign();
              else onAbort?.();
            }}
          >
            {t(
              isResign
                ? 'games.chess_v1.controls.yesResign'
                : 'games.chess_v1.controls.yesAbort',
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirming(null)}
          >
            {t('games.chess_v1.controls.cancel')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {hasTakebackOffer && !isMyTakebackOffer && (
        <div role="status" className="flex flex-col gap-1.5">
          <p className="text-[11px] text-center text-[var(--textSecondary)]">
            {t('games.chess_v1.controls.takebackRequested')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="primary" size="sm" onClick={onAcceptTakeback}>
              {t('games.chess_v1.actions.acceptTakeback')}
            </Button>
            <Button variant="outline" size="sm" onClick={onDeclineTakeback}>
              {t('games.chess_v1.actions.declineTakeback')}
            </Button>
          </div>
        </div>
      )}

      {hasDrawOffer && !isMyDrawOffer && (
        <div role="status" className="flex flex-col gap-1.5">
          <p className="text-[11px] text-center text-[var(--textSecondary)]">
            {t('games.chess_v1.controls.drawOffered')}
          </p>
          <div
            className={`grid gap-2 ${onDeclineDraw ? 'grid-cols-2' : 'grid-cols-1'}`}
          >
            <Button variant="primary" size="sm" onClick={onAcceptDraw}>
              {t('games.chess_v1.actions.acceptDraw')}
            </Button>
            {onDeclineDraw && (
              <Button variant="outline" size="sm" onClick={onDeclineDraw}>
                {t('games.chess_v1.actions.declineDraw')}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={hasTakebackOffer}
          onClick={onOfferTakeback}
        >
          {isMyTakebackOffer
            ? t('games.chess_v1.actions.takebackOffered')
            : t('games.chess_v1.actions.takeback')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={hasDrawOffer}
          onClick={onOfferDraw}
        >
          {isMyDrawOffer
            ? t('games.chess_v1.actions.drawOffered')
            : t('games.chess_v1.actions.draw')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirming(showAbort ? 'abort' : 'resign')}
        >
          {showAbort
            ? t('games.chess_v1.controls.abort')
            : t('games.chess_v1.actions.resign')}
        </Button>
      </div>
    </div>
  );
}

export const ChessGameActions = memo(ChessGameActionsImpl);
