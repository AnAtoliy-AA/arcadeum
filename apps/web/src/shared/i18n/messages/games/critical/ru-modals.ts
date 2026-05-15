export const modals = {
  common: { cancel: 'Отмена', confirm: 'Подтвердить', close: 'Закрыть' },
  omniscience: {
    title: 'Всеведение',
    subtitle: 'Вы видите все карты в игре!',
    emptyHand: 'В руке нет карт.',
  },
  targetedAttack: {
    title: 'Целевая атака',
    selectPlayer: 'Выберите цель',
    description: 'Выберите игрока, который сделает 2 хода вместо следующего.',
  },
  eventCombo: {
    title: 'Сыграть комбо',
    selectType: 'Выберите тип комбо',
    pairTrio: 'Пара/Тройка',
    selectComboCard: 'Выберите карту',
    fiver: 'Пятерка',
    anyFive: 'Любые 5 разных карт',
    selectMode: 'Выберите тип комбо',
    pair: 'Пара',
    pairDesc: 'Случайная карта у цели',
    trio: 'Тройка',
    trioDesc: 'Выбрать конкретную карту',
    trioMode: '2-3 карты',
    selectTarget: 'Выберите цель',
    selectCard: 'Выберите карту для запроса',
    cardsCount: '{{count}} карт',
    confirm: 'Сыграть комбо',
    stashCards: 'Выберите {{count}} разных карт',
    pickDiscard: 'Выберите карту из стопки сброса',
    selectCardHint: 'Выберите карту ниже',
    pickCardBlind: 'Выберите карту (вслепую)',
    cardLabel: 'Карта {{index}}',
  },
  seeTheFuture: { title: 'Верхние карты', confirm: 'Понятно!' },
  alterTheFuture: {
    title: 'Изменить будущее',
    description:
      'Переставьте верхние карты колоды. Верхняя карта (#1) будет вытянута следующей.',
    confirm: 'Применить порядок',
  },
  shareTheFuture: {
    title: 'Поделиться будущим',
  },
  favor: {
    title: 'Запросить одолжение',
    selectPlayer: 'Выберите игрока',
    description: 'Выберите игрока — он выберет, какую карту вам отдать.',
    cardsCount: '{{count}} карт',
    confirm: 'Запросить одолжение',
  },
  giveFavor: {
    title: 'Отдать карту',
    description:
      '{{player}} попросил одолжение. Выберите карту, которую отдадите ему.',
    confirm: 'Отдать карту',
  },
  defuse: {
    title: 'Обезвредить Критическую!',
    description: 'Выберите, куда вернуть Критическую карту в колоду',
    positionLabel: 'Позиция в колоде:',
    confirm: 'Положить карту',
  },
  stash: {
    title: 'Башня силы',
    description:
      'Выберите до 3 карт для защиты в хранилище. Их нельзя украсть или выменять.',
    confirm: 'Спрятать карты',
  },
  mark: {
    title: 'Пометить игрока',
    description:
      'Выберите игрока для метки. Случайная карта в его руке будет помечена. Если он её сыграет или сбросит, вы её украдете!',
    confirm: 'Пометить игрока',
  },
  stealDraw: {
    title: 'Я это заберу',
    description:
      'Выберите игрока. Следующая карта, которую он вытянет, будет украдена и попадет в вашу руку!',
    confirm: 'Подтвердить кражу',
  },
};
