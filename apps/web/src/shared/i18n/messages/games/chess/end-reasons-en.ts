/** Chess game-over reason sentences (keyed by ChessEndReason). */
export const enEndReasons = {
  checkmate: 'Decided by checkmate.',
  stalemate: 'Draw by stalemate: no legal moves and no check.',
  resignation: 'Decided by resignation.',
  timeout: 'Decided on time: a clock ran out.',
  timeout_vs_insufficient:
    'Draw: time ran out, but the opponent could not deliver mate.',
  repetition: 'Draw by threefold repetition.',
  fifty_move: 'Draw by the 50-move rule.',
  insufficient_material: 'Draw by insufficient material.',
  agreement: 'Draw by agreement.',
  aborted: 'The game was aborted.',
  variant_win: 'Decided by the variant win condition.',
};
