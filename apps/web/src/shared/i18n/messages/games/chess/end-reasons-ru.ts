/** Chess game-over reason sentences (keyed by ChessEndReason). */
export const ruEndReasons = {
  checkmate: 'Партия завершена матом.',
  stalemate: 'Ничья: пат, нет ходов и нет шаха.',
  resignation: 'Партия завершена сдачей.',
  timeout: 'Партия завершена по времени: флаг упал.',
  timeout_vs_insufficient:
    'Ничья: время вышло, но у соперника недостаточно материала для мата.',
  repetition: 'Ничья: троекратное повторение позиции.',
  fifty_move: 'Ничья по правилу 50 ходов.',
  insufficient_material: 'Ничья: недостаточно материала.',
  agreement: 'Ничья по соглашению.',
  aborted: 'Партия прервана.',
  variant_win: 'Победа по условию варианта.',
};
