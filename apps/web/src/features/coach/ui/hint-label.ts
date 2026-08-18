import { PIECE_SYMBOLS } from '@/widgets/ChessGame/types';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { ChessHint } from '../lib/hint-generator';

/**
 * Maps a generated chess hint to an i18n key + params so the UI can render a
 * short, localized "why" for the suggested move. Piece glyphs are used in
 * place of names to avoid per-locale piece vocabularies.
 */
export interface HintLabel {
  key: TranslationKey;
  params: Record<string, string | number>;
}

export function chessHintLabel(hint: ChessHint): HintLabel {
  const symbol = PIECE_SYMBOLS[hint.piece.type][hint.piece.color];
  const square = `${hint.to.file}${hint.to.rank}`;

  if (hint.isCastle === 'king') {
    return {
      key: 'games.chess_v1.coach.castleKing',
      params: {},
    };
  }
  if (hint.isCastle === 'queen') {
    return {
      key: 'games.chess_v1.coach.castleQueen',
      params: {},
    };
  }
  if (hint.promotion) {
    return {
      key: 'games.chess_v1.coach.promote',
      params: {
        symbol,
        square,
        promotion: PIECE_SYMBOLS[hint.promotion][hint.piece.color],
      },
    };
  }
  if (hint.captured) {
    return {
      key: 'games.chess_v1.coach.capture',
      params: {
        symbol,
        square,
        target: PIECE_SYMBOLS[hint.captured.type][hint.captured.color],
      },
    };
  }
  return {
    key: 'games.chess_v1.coach.move',
    params: { symbol, square },
  };
}
