import type { ChessClientState } from '../types';

export function generatePGN(state: ChessClientState): string {
  const lines: string[] = [];

  lines.push('[Event "Casual Game"]');
  lines.push('[Site "Arcadeum"]');
  lines.push('[Date "' + new Date().toISOString().split('T')[0] + '"]');
  lines.push('[White "' + getPlayerName(state, 'white') + '"]');
  lines.push('[Black "' + getPlayerName(state, 'black') + '"]');
  lines.push('[Result "' + getResultTag(state) + '"]');
  if (state.variant === 'chess960') {
    lines.push('[Variant "Chess960"]');
  }
  lines.push('');

  let moveText = '';
  for (let i = 0; i < state.moveHistory.length; i++) {
    const move = state.moveHistory[i];
    if (i % 2 === 0) {
      moveText += `${Math.floor(i / 2) + 1}. `;
    }
    moveText += move.notation + ' ';
  }

  moveText += getResultTag(state);
  lines.push(moveText.trim());

  return lines.join('\n');
}

export function generateMoveList(state: ChessClientState): string[] {
  return state.moveHistory.map((m) => m.notation);
}

function getPlayerName(
  state: ChessClientState,
  color: 'white' | 'black',
): string {
  const player = state.players.find((p) => p.color === color);
  if (!player) return color === 'white' ? 'White' : 'Black';
  if (player.isBot) return 'Bot';
  return player.playerId.slice(0, 8);
}

export function downloadPGN(state: ChessClientState): void {
  const pgn = generatePGN(state);
  const blob = new Blob([pgn], { type: 'application/x-chess-pgn' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chess-game-${Date.now()}.pgn`;
  a.click();
  URL.revokeObjectURL(url);
}

function getResultTag(state: ChessClientState): string {
  if (
    state.isDrawByAgreement ||
    state.isDrawByRepetition ||
    state.isDrawByFiftyMoveRule ||
    state.isInsufficientMaterial ||
    state.isStalemate
  ) {
    return '1/2-1/2';
  }
  if (state.winnerColor === 'white') return '1-0';
  if (state.winnerColor === 'black') return '0-1';
  return '*';
}

const FEN_CHARS: Record<string, string> = {
  pawn: 'p',
  knight: 'n',
  bishop: 'b',
  rook: 'r',
  queen: 'q',
  king: 'k',
};

/** Builds a full six-field FEN for the live position of the snapshot. */
export function generateFEN(
  state: Pick<
    ChessClientState,
    | 'board'
    | 'currentTurnColor'
    | 'castlingRights'
    | 'enPassantTarget'
    | 'halfMoveClock'
    | 'fullMoveNumber'
  >,
): string {
  const placement = state.board
    .map((row) => {
      let out = '';
      let empty = 0;
      for (const piece of row) {
        if (!piece) {
          empty++;
          continue;
        }
        if (empty) out += String(empty);
        empty = 0;
        const ch = FEN_CHARS[piece.type] ?? '?';
        out += piece.color === 'white' ? ch.toUpperCase() : ch;
      }
      return empty ? out + String(empty) : out;
    })
    .join('/');
  const c = state.castlingRights;
  const castling =
    `${c.whiteKingSide ? 'K' : ''}${c.whiteQueenSide ? 'Q' : ''}` +
    `${c.blackKingSide ? 'k' : ''}${c.blackQueenSide ? 'q' : ''}`;
  const ep = state.enPassantTarget
    ? `${state.enPassantTarget.file}${state.enPassantTarget.rank}`
    : '-';
  return [
    placement,
    state.currentTurnColor === 'white' ? 'w' : 'b',
    castling || '-',
    ep,
    String(state.halfMoveClock),
    String(state.fullMoveNumber),
  ].join(' ');
}
