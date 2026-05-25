export const frMessages = {
  tic_tac_toe: {
    name: 'Morpion',
    title: 'Morpion',
    subtitle: 'Choisis la taille du plateau et joue contre un ami.',
    sizeGroupLabel: 'Taille du plateau',
    sizeLabel: '{{n}}×{{n}}',
    boardLabel: 'Plateau de jeu',
    rules: 'Aligne {{n}} cases pour gagner',
    cellEmpty: 'Case {{i}} : vide',
    cellTaken: 'Case {{i}} : {{mark}}',
    status: {
      turn: 'Tour : {{player}}',
      winner: 'Gagnant : {{player}}',
      draw: 'Match nul',
    },
    score: {
      x: 'Victoires X',
      o: 'Victoires O',
      draws: 'Matchs nuls',
    },
    actions: {
      newRound: 'Nouvelle manche',
      resetScore: 'Réinitialiser le score',
    },
    meta: {
      title: 'Morpion — plateaux 3×3, 5×5, 7×7, 9×9',
      description:
        'Joue au morpion en ligne gratuitement. Choisis des plateaux de 3×3 à 9×9 et défie un ami sur le même appareil.',
    },
  },
};
