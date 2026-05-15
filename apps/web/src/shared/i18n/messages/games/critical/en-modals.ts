export const modals = {
  common: { cancel: 'Cancel', confirm: 'Confirm', close: 'Close' },
  omniscience: {
    title: 'Omniscience',
    subtitle: 'You see all cards in play!',
    emptyHand: 'No cards in hand.',
  },
  targetedAttack: {
    title: 'Targeted Attack',
    selectPlayer: 'Select Target Player',
    description: 'Choose a player to take 2 turns instead of the next player.',
  },
  eventCombo: {
    title: 'Play Combo',
    selectType: 'Select Combo Type',
    pairTrio: 'Pair/Trio',
    selectComboCard: 'Select Card',
    fiver: 'Fiver',
    anyFive: 'Any 5 different cards',
    selectMode: 'Select Combo Mode',
    pair: 'Pair',
    pairDesc: 'Random card from target',
    trio: 'Trio',
    trioDesc: 'Choose specific card',
    trioMode: '2-3 cards',
    selectTarget: 'Select Target Player',
    selectCard: 'Select Card to Request',
    cardsCount: '{{count}} cards',
    confirm: 'Play Combo',
    stashCards: 'Select {{count}} different cards',
    pickDiscard: 'Pick a card from the discard pile',
    selectCardHint: 'Select a card below',
    pickCardBlind: 'Pick a card (blind)',
    cardLabel: 'Card {{index}}',
  },
  seeTheFuture: { title: 'Top Cards', confirm: 'Got it!' },
  alterTheFuture: {
    title: 'Alter the Future',
    description:
      'Rearrange the top cards of the deck. The top card (#1) will be drawn next.',
    confirm: 'Commit Order',
  },
  shareTheFuture: {
    title: 'Share the Future',
  },
  favor: {
    title: 'Request Favor',
    selectPlayer: 'Select Player',
    description: 'Select a player - they will choose which card to give you.',
    cardsCount: '{{count}} cards',
    confirm: 'Request Favor',
  },
  giveFavor: {
    title: 'Give a Card',
    description:
      '{{player}} has requested a favor. Choose a card to give them.',
    confirm: 'Give Card',
  },
  defuse: {
    title: 'Defuse Critical!',
    description: 'Choose where to place the Critical back in the deck',
    positionLabel: 'Position in deck:',
    confirm: 'Place Card',
  },
  stash: {
    title: 'Tower of Power',
    description:
      "Select up to 3 cards to protect in your protected stash. Stashed cards can't be stolen or traded.",
    confirm: 'Stash Cards',
  },
  mark: {
    title: 'Mark Player',
    description:
      'Choose a player to mark. A random card in their hand will be marked. If they play or discard it, you steal it!',
    confirm: 'Mark Player',
  },
  stealDraw: {
    title: "I'll Take That",
    description:
      'Choose a player. The next card they draw will be stolen and added to your hand instead!',
    confirm: 'Confirm Theft',
  },
};
