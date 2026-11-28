import type { TranslationKey } from '@/shared/i18n/useTranslation';
import type { ChessPiece, File, Rank } from '../types';

type TranslateFn = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

export interface SquareLabelState {
  file: File;
  rank: Rank;
  piece: ChessPiece | null;
  selected?: boolean;
  legalTarget?: boolean;
  lastMoved?: boolean;
  kingCheck?: boolean;
  hintMoved?: boolean;
}

/**
 * Screen-reader label for a board square, e.g. "e4 white pawn, selected,
 * legal move". Square names stay algebraic in every locale.
 */
export function buildSquareLabel(t: TranslateFn, s: SquareLabelState): string {
  const square = `${s.file}${s.rank}`;
  const base = s.piece
    ? t('games.chess_v1.board.withPiece', {
        square,
        color: t(`games.chess_v1.board.${s.piece.color}` as TranslationKey),
        piece: t(
          `games.chess_v1.board.pieces.${s.piece.type}` as TranslationKey,
        ),
      })
    : square;
  const states: string[] = [];
  if (s.selected) states.push(t('games.chess_v1.board.selected'));
  if (s.legalTarget) states.push(t('games.chess_v1.board.legalMove'));
  if (s.kingCheck) states.push(t('games.chess_v1.board.check'));
  if (s.lastMoved) states.push(t('games.chess_v1.board.lastMove'));
  if (s.hintMoved) states.push(t('games.chess_v1.board.suggested'));
  return [base, ...states].join(', ');
}
