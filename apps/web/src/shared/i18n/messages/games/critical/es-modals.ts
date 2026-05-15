export const modals = {
  common: { cancel: 'Cancelar', confirm: 'Confirmar', close: 'Cerrar' },
  omniscience: {
    title: 'Omnisciencia',
    subtitle: '¡Ves todas las cartas en juego!',
    emptyHand: 'Sin cartas en mano.',
  },
  alterTheFuture: {
    title: 'Alterar el Futuro',
    description:
      'Reorganiza las cartas superiores del mazo. La carta superior (#1) será robada a continuación.',
    confirm: 'Confirmar Orden',
  },
  shareTheFuture: {
    title: 'Compartir el Futuro',
  },
  eventCombo: {
    title: 'Jugar Combo',
    selectType: 'Seleccionar Tipo de Combo',
    pairTrio: 'Pareja/Trío',
    selectComboCard: 'Seleccionar Carta',
    fiver: 'Cinco',
    anyFive: 'Cualquier 5 cartas diferentes',
    selectMode: 'Seleccionar Modo de Combo',
    pair: 'Pareja',
    pairDesc: 'Carta aleatoria del objetivo',
    trio: 'Trío',
    trioDesc: 'Elegir carta específica',
    trioMode: '2-3 cartas',
    selectTarget: 'Seleccionar Jugador Objetivo',
    selectCard: 'Seleccionar Carta a Solicitar',
    cardsCount: '{{count}} cartas',
    confirm: 'Jugar Combo',
    stashCards: 'Seleccionar {{count}} cartas diferentes',
    pickDiscard: 'Elige una carta de la pila de descartes',
    selectCardHint: 'Selecciona una carta a continuación',
    pickCardBlind: 'Elige una carta (a ciegas)',
    cardLabel: 'Carta {{index}}',
  },
  seeTheFuture: { title: 'Cartas Superiores', confirm: '¡Entendido!' },
  targetedAttack: {
    title: 'Ataque Dirigido',
    selectPlayer: 'Seleccionar Jugador',
    description:
      'Elige un jugador para que tome 2 turnos en lugar del siguiente jugador.',
  },
  favor: {
    title: 'Solicitar Favor',
    selectPlayer: 'Seleccionar Jugador',
    description:
      'El jugador seleccionado te dará una carta aleatoria de su mano.',
    cardsCount: '{{count}} cartas',
    confirm: 'Tomar Carta Aleatoria',
  },
  giveFavor: {
    title: 'Dar una Carta',
    description:
      '{{player}} ha solicitado un favor. Elige una carta para darle.',
    confirm: 'Dar Carta',
  },
  defuse: {
    title: '¡Desactivar Incidente Crítico!',
    description: 'Elige dónde colocar el Incidente Crítico en el mazo',
    positionLabel: 'Posición en el mazo:',
    confirm: 'Colocar Carta',
  },
  stash: {
    title: 'Torre de Poder',
    description:
      'Selecciona hasta 3 cartas para proteger en tu reserva protegida. Las cartas guardadas no pueden ser robadas ni intercambiadas.',
    confirm: 'Guardar Cartas',
  },
  mark: {
    title: 'Marcar Jugador',
    description:
      'Elige un jugador para marcar. Se marcará una carta al azar en su mano. ¡Si la juegan o descartan, la robas!',
    confirm: 'Marcar Jugador',
  },
  stealDraw: {
    title: 'Me Lo Quedo',
    description:
      'Elige un jugador. ¡La próxima carta que robe será robada y añadida a tu mano en su lugar!',
    confirm: 'Confirmar Robo',
  },
};
