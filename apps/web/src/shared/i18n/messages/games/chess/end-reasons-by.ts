/** Chess game-over reason sentences (keyed by ChessEndReason). */
export const byEndReasons = {
  checkmate: 'Партыя завершана матам.',
  stalemate: 'Нічыя: пат, няма хадоў і няма шаха.',
  resignation: 'Партыя завершана здачай.',
  timeout: 'Партыя завершана па часе: сцяжок упаў.',
  timeout_vs_insufficient:
    'Нічыя: час скончыўся, але ў суперніка недастаткова матэрыялу для мату.',
  repetition: 'Нічыя: трохразовае паўтарэнне пазіцыі.',
  fifty_move: 'Нічыя па правіле 50 хадоў.',
  insufficient_material: 'Нічыя: недастаткова матэрыялу.',
  agreement: 'Нічыя па згодзе.',
  aborted: 'Партыя перапынена.',
  variant_win: 'Перамога па ўмове варыянта.',
};
