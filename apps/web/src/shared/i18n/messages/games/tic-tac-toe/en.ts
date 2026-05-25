export const enMessages = {
  tic_tac_toe: {
    name: 'Tic-Tac-Toe',
    title: 'Tic-Tac-Toe',
    subtitle: 'Pick a board size and play locally against a friend.',
    sizeGroupLabel: 'Board size',
    sizeLabel: '{{n}}×{{n}}',
    boardLabel: 'Game board',
    rules: 'Line up {{n}} in a row to win',
    cellEmpty: 'Cell {{i}}: empty',
    cellTaken: 'Cell {{i}}: {{mark}}',
    status: {
      turn: 'Turn: {{player}}',
      winner: 'Winner: {{player}}',
      draw: "It's a draw",
    },
    score: {
      x: 'X wins',
      o: 'O wins',
      draws: 'Draws',
    },
    actions: {
      newRound: 'New round',
      resetScore: 'Reset score',
    },
    meta: {
      title: 'Tic-Tac-Toe — 3×3, 5×5, 7×7, 9×9 boards',
      description:
        'Play Tic-Tac-Toe online for free. Choose from 3×3 up to 9×9 boards and challenge a friend on the same device.',
    },
  },
};
