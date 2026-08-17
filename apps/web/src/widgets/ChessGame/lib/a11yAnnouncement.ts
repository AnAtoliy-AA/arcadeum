import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { ChessClientState } from '../types';

type TranslateFn = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

/**
 * Computes a screen-reader announcement for the current chess state:
 * game over result, check, or whose turn it is. Returns `undefined` while the
 * game is loading so the live region stays quiet.
 */
export function getChessA11yAnnouncement(
  snapshot: ChessClientState | null,
  isGameOver: boolean,
  currentUserId: string | null,
  resolveName: (id: string) => string,
  t: TranslateFn,
): string | undefined {
  if (!snapshot) return undefined;

  if (isGameOver) {
    const winner = snapshot.players.find(
      (p) => p.color === snapshot.winnerColor,
    );
    const isDraw =
      snapshot.isDrawByAgreement ||
      snapshot.isStalemate ||
      snapshot.isDrawByRepetition ||
      snapshot.isDrawByFiftyMoveRule;
    if (isDraw) return t('games.chess_v1.status.draw');
    return t('games.chess_v1.status.winner', {
      player: winner?.playerId ? resolveName(winner.playerId) : '',
    });
  }

  if (snapshot.isCheck) return t('games.chess_v1.status.check');

  const current = snapshot.players.find(
    (p) => p.color === snapshot.currentTurnColor,
  );
  if (current?.playerId === currentUserId)
    return t('games.chess_v1.status.yourTurn');
  return t('games.chess_v1.status.turn', {
    player: current?.playerId ? resolveName(current.playerId) : '',
  });
}
