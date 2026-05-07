export const ruMessages = {
  sea_battle_v1: {
    name: 'Морской Бой',
    description: 'Классический морской бой до 6 игроков',
    colors: {
      ship: 'Корабль',
      hit: 'Попал',
      miss: 'Мимо',
      empty: 'Пусто',
    },
    challengePlayer: 'Вызвать {{name}} на Морской бой?',
    rules: {
      title: 'Правила Игры',
      headers: {
        objective: 'Цель',
        gameplay: 'Игровой процесс',
        placement: 'Расстановка кораблей',
        battle: 'Фаза боя',
        ships: 'Ваш флот',
      },
      objective:
        'Потопите все вражеские корабли, прежде чем они потопят ваши! Побеждает последний игрок с оставшимися кораблями.',
      gameplay:
        'Игра состоит из двух фаз: Расстановка и Бой. Сначала тайно расставьте свои корабли на поле 10×10. Затем по очереди стреляйте по полям противников, чтобы найти и потопить их корабли.',
      placement:
        'Разместите все корабли на поле до начала боя. Корабли не могут перекрывать друг друга или касаться. Нажмите для размещения, используйте кнопку для поворота.',
      battle:
        'В свой ход нажмите на поле противника, чтобы выстрелить. Попадания отмечаются красным, промахи - белым. Когда все клетки корабля подбиты, он тонет!',
      ships: `• Линкор (4 клетки) - Самый большой корабль
• Крейсер (3 клетки) - Быстрый ударный корабль
• Эсминнец (2 клетки) - Маленький, но маневренный
• Подлодка (1 клетка) - Скрытное судно`,
    },
    variants: {
      classic: {
        name: 'Классика',
        description: 'Традиционный морской бой',
      },
      modern: {
        name: 'Модерн II',
        description: 'Современная морская война',
      },
      pixel: {
        name: 'Пиксель-арт',
        description: 'Ретро-стыль піксель-арта',
      },
      cartoon: {
        name: 'Мультяшный',
        description: 'Забавные персонажи',
      },
      cyber: {
        name: 'Киберпанк',
        description: 'Высокотехнологичный дизайн',
      },
      vintage: {
        name: 'Винтаж',
        description: 'Старинная морская карта',
      },
      nebula: {
        name: 'Туманность',
        description: 'Глыбокі космас',
      },
      forest: {
        name: 'Лес',
        description: 'Лесная маскировка',
      },
      sunset: {
        name: 'Закат',
        description: 'Атмосферные сумерки',
      },
      monochrome: {
        name: 'Noir',
        description: 'Элегантный монохром',
      },
    },
    table: {
      state: {
        yourBoard: 'Ваша доска',
        opponentBoard: 'Доска противника',
        shipsRemaining: 'Осталось кораблей',
        shipsPalette: 'Корабли для расстановки',
        vertical: 'Вертикально',
        horizontal: 'Горизонтально',
        cells: 'Клетки',
      },
      players: {
        you: 'Вы',
        alive: 'В игре',
        eliminated: 'Выбыл',
        yourTurn: 'Ваш ход',
        yourTurnAttack: '🎯 Ваш ход - Атакуйте противника!',
        placeShips: 'Расставьте свои корабли',
        waitingFor: 'Ждем {{player}}...',
        targetBadge: 'Цель',
      },
      phase: {
        lobby: 'Лобби',
        placement: 'Расстановка',
        battle: 'Бой',
        completed: 'Игра окончена',
      },
      actions: {
        start: 'Начать игру',
        starting: 'Запуск...',
        confirmPlacement: 'Подтвердить расстановку',
        rotate: 'Повернуть',
        challenge: 'Вызов',
        fire: 'Огонь!',
        autoPlace: 'Авторасстановка',
        randomize: 'Перемешать',
        resetPlacement: 'Сбросить',
        waitingForOthers: 'Ожидание других...',
        dragHint: 'Перетащите на поле · Нажмите для выбора',
      },
      attack: {
        hit: 'Попал!',
        miss: 'Мимо',
        sunk: 'Убил!',
        shipSunk: '{{ship}} потоплен!',
      },
      lobby: {
        waitingToStart: 'Ожидание начала игры...',
        playersInLobby: 'Игроки в лобби',
        needTwoPlayers: 'Нужно минимум 2 игрока',
        maxFourPlayers: 'Максимум 4 игрока',
        hostCanStart: "Нажмите 'Начать игру', когда готовы",
        waitingForHost: 'Ожидание начала игры хостом',
        hostControls: 'Управление хоста',
        theme: 'Тема',
        roomInfo: 'Информация о комнате',
        host: 'Хост',
      },
      victory: {
        title: 'Победа!',
        message: 'Вы потопили все вражеские корабли!',
      },
      defeat: {
        title: 'Поражение',
        message: 'Все ваши корабли были потоплены.',
      },
      controlPanel: {
        spectating: 'Наблюдение',
        fullscreen: 'Полноэкранный режим',
        exitFullscreen: 'Выйти из полноэкранного режима',
        enterFullscreen: 'На весь экран',
        rules: 'Правила',
        leaveRoom: 'Покинуть',
        leaveConfirmMessage:
          'Вы уверены, что хотите покинуть игру? Вы будете удалены из списка участников.',
        exitRoom: 'Выйти',
        exitRoomTooltip: 'Вернуться в лобби, но остаться в игре',
        leaveGameTooltip: 'Удалить себя из игры и вернуться в лобби',
      },
      chat: {
        title: 'Чат битвы',
        empty: 'Нет сообщений',
        send: 'Отпр.',
        show: 'Показать чат',
        hide: 'Скрыть чат',
        placeholder: 'Введите сообщение...',
      },
    },
    teamMode: {
      enableLabel: 'Командный режим',
      disableLabel: 'Отключить командный режим',
      hideShipsLabel: 'Скрывать корабли от союзников',
      teammateBadge: 'Союзник',
      cannotAttackTeammate: 'Нельзя атаковать союзника',
      description:
        'Играйте в командах. Задайте количество команд и размеры — игроки могут выбрать сами или быть назначены хостом.',
      setup: {
        title: 'Настройка команд',
        teamNamePlaceholder: 'Название команды',
        teamColorLabel: 'Цвет',
        slotCountLabel: 'Слоты',
        addTeam: 'Добавить команду',
        removeTeam: 'Удалить команду',
        addBot: 'Добавить бота',
        removeBot: 'Удалить',
        totalSlots: 'Всего слотов: {{used}} / {{max}}',
        minTeamsHint: 'Нужно минимум 2 команды',
        maxTeamsHint: 'До 4 команд (в каждой минимум 2 игрока)',
        minSizeHint: 'В каждой команде должно быть минимум 2 слота',
      },
      slots: {
        joinTeam: 'Вступить в команду',
        leaveTeam: 'Покинуть команду',
        moveTo: 'Перейти в {{team}}',
        botLabel: 'Бот',
        emptySlot: 'Свободное место',
      },
      unassigned: {
        title: 'Без команды',
        empty: 'Все распределены по командам',
      },
      start: {
        disabledNotFull: 'Все слоты должны быть заполнены перед началом',
        disabledNotEnoughTeams: 'Нужно минимум 2 команды',
      },
      errors: {
        roomFull: 'В командном режиме не более 8 игроков',
        teamFull: 'Эта команда заполнена',
        teamNotFound: 'Команда не найдена',
        notHost: 'Только хост может изменить состав команд',
      },
      chat: {
        channelTeam: 'Команда',
        channelAll: 'Все',
        channelPrivate: 'Лично',
      },
      banner: {
        eliminatedSpectator:
          'Вы выбыли. Вы по-прежнему можете общаться в чате команды и наблюдать за боем.',
        teamWon: '{{team}} побеждает!',
      },
    },
  },
};
