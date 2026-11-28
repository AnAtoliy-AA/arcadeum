/** Chess game-over reason sentences (keyed by ChessEndReason). */
export const frEndReasons = {
  checkmate: 'Décidée par échec et mat.',
  stalemate: 'Nulle par pat : aucun coup légal et pas d’échec.',
  resignation: 'Décidée par abandon.',
  timeout: 'Décidée au temps : une pendule est tombée.',
  timeout_vs_insufficient:
    'Nulle : temps écoulé, mais l’adversaire ne pouvait pas mater.',
  repetition: 'Nulle par triple répétition.',
  fifty_move: 'Nulle par la règle des 50 coups.',
  insufficient_material: 'Nulle par matériel insuffisant.',
  agreement: 'Nulle par accord mutuel.',
  aborted: 'La partie a été annulée.',
  variant_win: 'Décidée par la condition de victoire de la variante.',
};
