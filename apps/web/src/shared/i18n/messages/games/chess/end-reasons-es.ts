/** Chess game-over reason sentences (keyed by ChessEndReason). */
export const esEndReasons = {
  checkmate: 'Decidida por jaque mate.',
  stalemate: 'Tablas por ahogado: sin jugadas legales y sin jaque.',
  resignation: 'Decidida por abandono.',
  timeout: 'Decidida por tiempo: se agotó un reloj.',
  timeout_vs_insufficient:
    'Tablas: se agotó el tiempo, pero el rival no podía dar mate.',
  repetition: 'Tablas por triple repetición.',
  fifty_move: 'Tablas por la regla de los 50 movimientos.',
  insufficient_material: 'Tablas por material insuficiente.',
  agreement: 'Tablas por acuerdo.',
  aborted: 'La partida fue anulada.',
  variant_win: 'Decidida por la condición de victoria de la variante.',
};
