import type { DeepPartial } from '../base-types';

export interface WalletMessages {
  balance: {
    title: string;
    subtitle: string;
    coins: string;
    gems: string;
    arcadeum: string;
  };
  withdraw: {
    title: string;
    description: string;
    connectButton: string;
    connecting: string;
    connected: string;
    disconnect: string;
    amountLabel: string;
    amountPlaceholder: string;
    feeLabel: string;
    youReceive: string;
    submitButton: string;
    processing: string;
    success: string;
    error: string;
    phantomNotFound: string;
    connectionFailed: string;
    disconnectFailed: string;
  };
  history: {
    filterAll: string;
    filterCoins: string;
    filterGems: string;
    emptyTitle: string;
    emptyDescription: string;
    colReason: string;
    colChange: string;
    colBalanceAfter: string;
    colWhen: string;
    nextPage: string;
  };
  reasons: {
    admin_grant: string;
    admin_deduct: string;
    game_win: string;
    tournament_entry: string;
    tournament_refund: string;
    tournament_prize: string;
    gem_purchase: string;
    gem_to_coin_conversion_debit: string;
    gem_to_coin_conversion_credit: string;
    referral_bonus: string;
    referral_tier_bonus: string;
    daily_reward: string;
    shop_purchase: string;
    shop_sell_refund: string;
    battle_pass_reward: string;
    achievement: string;
    daily_challenge: string;
    token_purchase: string;
    token_withdrawal: string;
    token_withdrawal_fee: string;
    tournament_token_prize: string;
    wager_entry: string;
    wager_prize: string;
    wager_fee: string;
  };
}

export const en: WalletMessages = {
  balance: {
    title: 'Your Wallet',
    subtitle: 'Coins are earned through play. Gems are purchased.',
    coins: 'Coins',
    gems: 'Gems',
    arcadeum: 'ARCADEUM',
  },
  withdraw: {
    title: 'Withdraw to Wallet',
    description:
      'Transfer your ARCADEUM tokens to your Phantom wallet. A 2% fee applies.',
    connectButton: 'Connect Phantom Wallet',
    connecting: 'Connecting...',
    connected: 'Connected',
    disconnect: 'Disconnect',
    amountLabel: 'Amount (Available: {balance} ARCADEUM)',
    amountPlaceholder: 'Enter amount',
    feeLabel: 'Fee (2%): {fee} ARCADEUM',
    youReceive: 'You receive: {amount} ARCADEUM',
    submitButton: 'Withdraw',
    processing: 'Processing...',
    success: 'Withdrawal successful! TX: {signature}',
    error: 'Withdrawal failed',
    phantomNotFound: 'Phantom wallet not found. Please install it.',
    connectionFailed: 'Connection failed',
    disconnectFailed: 'Failed to disconnect wallet',
  },
  history: {
    filterAll: 'All',
    filterCoins: 'Coins',
    filterGems: 'Gems',
    emptyTitle: 'No transactions yet',
    emptyDescription: 'Your wallet activity will appear here.',
    colReason: 'Reason',
    colChange: 'Change',
    colBalanceAfter: 'Balance after',
    colWhen: 'When',
    nextPage: 'Next',
  },
  reasons: {
    admin_grant: 'Granted by admin',
    admin_deduct: 'Deducted by admin',
    game_win: 'Game win',
    tournament_entry: 'Tournament entry',
    tournament_refund: 'Tournament refund',
    tournament_prize: 'Tournament prize',
    gem_purchase: 'Gems purchased',
    gem_to_coin_conversion_debit: 'Converted gems to coins',
    gem_to_coin_conversion_credit: 'Coins from conversion',
    referral_bonus: 'Referral bonus',
    referral_tier_bonus: 'Referral tier bonus',
    daily_reward: 'Daily reward',
    shop_purchase: 'Shop purchase',
    shop_sell_refund: 'Shop sell refund',
    battle_pass_reward: 'Battle pass reward',
    achievement: 'Achievement',
    daily_challenge: 'Daily challenge',
    token_purchase: 'Token purchase',
    token_withdrawal: 'Token withdrawal',
    token_withdrawal_fee: 'Token withdrawal fee',
    tournament_token_prize: 'Tournament token prize',
    wager_entry: 'Wager entry',
    wager_prize: 'Wager prize',
    wager_fee: 'Wager fee',
  },
};

export const ru: DeepPartial<WalletMessages> = {
  balance: {
    title: 'Ваш кошелёк',
    subtitle: 'Монеты зарабатываются в игре. Гемы покупаются.',
    coins: 'Монеты',
    gems: 'Гемы',
    arcadeum: 'ARCADEUM',
  },
  withdraw: {
    title: 'Вывод в кошелёк',
    description:
      'Переведите токены ARCADEUM в кошелёк Phantom. Взимается комиссия 2%.',
    connectButton: 'Подключить Phantom кошелёк',
    connecting: 'Подключение...',
    connected: 'Подключено',
    disconnect: 'Отключить',
    amountLabel: 'Сумма (Доступно: {balance} ARCADEUM)',
    amountPlaceholder: 'Введите сумму',
    feeLabel: 'Комиссия (2%): {fee} ARCADEUM',
    youReceive: 'Вы получите: {amount} ARCADEUM',
    submitButton: 'Вывести',
    processing: 'Обработка...',
    success: 'Вывод успешен! TX: {signature}',
    error: 'Ошибка вывода',
    phantomNotFound: 'Кошелёк Phantom не найден. Установите его.',
    connectionFailed: 'Ошибка подключения',
    disconnectFailed: 'Не удалось отключить кошелёк',
  },
  history: {
    filterAll: 'Все',
    filterCoins: 'Монеты',
    filterGems: 'Гемы',
    emptyTitle: 'Пока нет транзакций',
    emptyDescription: 'Активность вашего кошелька появится здесь.',
    colReason: 'Причина',
    colChange: 'Изменение',
    colBalanceAfter: 'Баланс после',
    colWhen: 'Когда',
    nextPage: 'Далее',
  },
  reasons: {
    admin_grant: 'Начислено администратором',
    admin_deduct: 'Списано администратором',
    game_win: 'Выигрыш в игре',
    tournament_entry: 'Участие в турнире',
    tournament_refund: 'Возврат турнира',
    tournament_prize: 'Приз турнира',
    gem_purchase: 'Покупка гемов',
    gem_to_coin_conversion_debit: 'Конвертация гемов в монеты',
    gem_to_coin_conversion_credit: 'Монеты из конвертации',
    referral_bonus: 'Реферальный бонус',
    referral_tier_bonus: 'Бонус уровня реферала',
    daily_reward: 'Ежедневная награда',
    shop_purchase: 'Покупка в магазине',
    shop_sell_refund: 'Возврат продажи',
    battle_pass_reward: 'Награда боевого пропуска',
    achievement: 'Достижение',
    daily_challenge: 'Ежедневное задание',
    token_purchase: 'Покупка токенов',
    token_withdrawal: 'Вывод токенов',
    token_withdrawal_fee: 'Комиссия за вывод',
    tournament_token_prize: 'Приз турнира в токенах',
    wager_entry: 'Ставка',
    wager_prize: 'Выигрыш ставки',
    wager_fee: 'Комиссия ставки',
  },
};

export const es: DeepPartial<WalletMessages> = {
  balance: {
    title: 'Tu Monedero',
    subtitle: 'Las monedas se ganan jugando. Las gemas se compran.',
    coins: 'Monedas',
    gems: 'Gemas',
    arcadeum: 'ARCADEUM',
  },
  withdraw: {
    title: 'Retirar al monedero',
    description:
      'Transfiere tus tokens ARCADEUM a tu monedero Phantom. Se aplica una comisión del 2%.',
    connectButton: 'Conectar monedero Phantom',
    connecting: 'Conectando...',
    connected: 'Conectado',
    disconnect: 'Desconectar',
    amountLabel: 'Cantidad (Disponible: {balance} ARCADEUM)',
    amountPlaceholder: 'Ingresa la cantidad',
    feeLabel: 'Comisión (2%): {fee} ARCADEUM',
    youReceive: 'Recibes: {amount} ARCADEUM',
    submitButton: 'Retirar',
    processing: 'Procesando...',
    success: '¡Retiro exitoso! TX: {signature}',
    error: 'Error en el retiro',
    phantomNotFound:
      'Monedero Phantom no encontrado. Por favor, instálalo.',
    connectionFailed: 'Error de conexión',
    disconnectFailed: 'Error al desconectar el monedero',
  },
  history: {
    filterAll: 'Todos',
    filterCoins: 'Monedas',
    filterGems: 'Gemas',
    emptyTitle: 'Sin transacciones aún',
    emptyDescription: 'La actividad de tu monedero aparecerá aquí.',
    colReason: 'Razón',
    colChange: 'Cambio',
    colBalanceAfter: 'Saldo después',
    colWhen: 'Cuándo',
    nextPage: 'Siguiente',
  },
  reasons: {
    admin_grant: 'Otorgado por administrador',
    admin_deduct: 'Deducido por administrador',
    game_win: 'Victoria en juego',
    tournament_entry: 'Entrada de torneo',
    tournament_refund: 'Reembolso de torneo',
    tournament_prize: 'Premio de torneo',
    gem_purchase: 'Gemas compradas',
    gem_to_coin_conversion_debit: 'Convertido gemas a monedas',
    gem_to_coin_conversion_credit: 'Monedas de conversión',
    referral_bonus: 'Bono de referido',
    referral_tier_bonus: 'Bono de nivel de referido',
    daily_reward: 'Recompensa diaria',
    shop_purchase: 'Compra en tienda',
    shop_sell_refund: 'Reembolso de venta',
    battle_pass_reward: 'Recompensa de pase de batalla',
    achievement: 'Logro',
    daily_challenge: 'Desafío diario',
    token_purchase: 'Compra de tokens',
    token_withdrawal: 'Retiro de tokens',
    token_withdrawal_fee: 'Comisión de retiro',
    tournament_token_prize: 'Premio de tokens en torneo',
    wager_entry: 'Apuesta',
    wager_prize: 'Premio de apuesta',
    wager_fee: 'Comisión de apuesta',
  },
};

export const fr: DeepPartial<WalletMessages> = {
  balance: {
    title: 'Votre Portefeuille',
    subtitle:
      'Les pièces sont gagnées en jouant. Les gemmes sont achetées.',
    coins: 'Pièces',
    gems: 'Gemmes',
    arcadeum: 'ARCADEUM',
  },
  withdraw: {
    title: 'Retirer vers le portefeuille',
    description:
      'Transférez vos tokens ARCADEUM vers votre portefeuille Phantom. Une commission de 2% s\'applique.',
    connectButton: 'Connecter le portefeuille Phantom',
    connecting: 'Connexion...',
    connected: 'Connecté',
    disconnect: 'Déconnecter',
    amountLabel: 'Montant (Disponible: {balance} ARCADEUM)',
    amountPlaceholder: 'Entrez le montant',
    feeLabel: 'Commission (2%): {fee} ARCADEUM',
    youReceive: 'Vous recevez: {amount} ARCADEUM',
    submitButton: 'Retirer',
    processing: 'Traitement...',
    success: 'Retrait réussi! TX: {signature}',
    error: 'Échec du retrait',
    phantomNotFound:
      'Portefeuille Phantom non trouvé. Veuillez l\'installer.',
    connectionFailed: 'Échec de la connexion',
    disconnectFailed: 'Échec de la déconnexion du portefeuille',
  },
  history: {
    filterAll: 'Tout',
    filterCoins: 'Pièces',
    filterGems: 'Gemmes',
    emptyTitle: 'Aucune transaction pour le moment',
    emptyDescription:
      "L'activité de votre portefeuille apparaîtra ici.",
    colReason: 'Raison',
    colChange: 'Changement',
    colBalanceAfter: 'Solde après',
    colWhen: 'Quand',
    nextPage: 'Suivant',
  },
  reasons: {
    admin_grant: 'Accordé par admin',
    admin_deduct: 'Déduit par admin',
    game_win: 'Victoire de jeu',
    tournament_entry: 'Entrée de tournoi',
    tournament_refund: 'Remboursement de tournoi',
    tournament_prize: 'Prix de tournoi',
    gem_purchase: 'Gemmes achetées',
    gem_to_coin_conversion_debit: 'Converti gemmes en pièces',
    gem_to_coin_conversion_credit: 'Pièces de conversion',
    referral_bonus: 'Bonus de parrainage',
    referral_tier_bonus: 'Bonus de niveau de parrainage',
    daily_reward: 'Récompense quotidienne',
    shop_purchase: 'Achat en boutique',
    shop_sell_refund: 'Remboursement de vente',
    battle_pass_reward: 'Récompense du pass de bataille',
    achievement: 'Succès',
    daily_challenge: 'Défi quotidien',
    token_purchase: 'Achat de tokens',
    token_withdrawal: 'Retrait de tokens',
    token_withdrawal_fee: 'Commission de retrait',
    tournament_token_prize: 'Prix de tokens en tournoi',
    wager_entry: 'Pari',
    wager_prize: 'Prix de pari',
    wager_fee: 'Commission de pari',
  },
};

export const by: DeepPartial<WalletMessages> = {
  balance: {
    title: 'Ваш кашалёк',
    subtitle: 'Манеты зарабоўваюцца ў гульні. Гемы купляюцца.',
    coins: 'Манеты',
    gems: 'Гемы',
    arcadeum: 'ARCADEUM',
  },
  withdraw: {
    title: 'Вывад у кашалёк',
    description:
      'Перавядзіце токены ARCADEUM у кашалёк Phantom. Спаганяецца камісія 2%.',
    connectButton: 'Падключыць Phantom кашалёк',
    connecting: 'Падключэнне...',
    connected: 'Падключана',
    disconnect: 'Адключыць',
    amountLabel: 'Сума (Даступна: {balance} ARCADEUM)',
    amountPlaceholder: 'Увядзіце суму',
    feeLabel: 'Камісія (2%): {fee} ARCADEUM',
    youReceive: 'Вы атрымаеце: {amount} ARCADEUM',
    submitButton: 'Вывесці',
    processing: 'Апрацоўка...',
    success: 'Вывад паспяховы! TX: {signature}',
    error: 'Памылка вываду',
    phantomNotFound: 'Кашалёк Phantom не знойдзены. Усталюйце яго.',
    connectionFailed: 'Памылка падключэння',
    disconnectFailed: 'Не ўдалося адключыць кашалёк',
  },
  history: {
    filterAll: 'Усе',
    filterCoins: 'Манеты',
    filterGems: 'Гемы',
    emptyTitle: 'Пакуль няма транзакцый',
    emptyDescription: 'Актыўнасць вашага кашалька з\'явіцца тут.',
    colReason: 'Прычына',
    colChange: 'Змена',
    colBalanceAfter: 'Баланс пасля',
    colWhen: 'Калі',
    nextPage: 'Далей',
  },
  reasons: {
    admin_grant: 'Налічана адміністратарам',
    admin_deduct: 'Спісана адміністратарам',
    game_win: 'Выйгрыш у гульні',
    tournament_entry: 'Удзел у турніры',
    tournament_refund: 'Вяртанне турніру',
    tournament_prize: 'Прыз турніру',
    gem_purchase: 'Пакупка гемаў',
    gem_to_coin_conversion_debit: 'Канвертацыя гемаў у манеты',
    gem_to_coin_conversion_credit: 'Манеты з канвертацыі',
    referral_bonus: 'Рэферальны бонус',
    referral_tier_bonus: 'Бонус узроўню рэферала',
    daily_reward: 'Штодзённая ўзнагарода',
    shop_purchase: 'Пакупка ў краме',
    shop_sell_refund: 'Вяртанне продажу',
    battle_pass_reward: 'Узнагарода баявога пропуску',
    achievement: 'Дасягненне',
    daily_challenge: 'Штодзённае заданне',
    token_purchase: 'Пакупка токенаў',
    token_withdrawal: 'Вывад токенаў',
    token_withdrawal_fee: 'Камісія за вывад',
    tournament_token_prize: 'Прыз турніру ў токенах',
    wager_entry: 'Стаўка',
    wager_prize: 'Выйгрыш стаўкі',
    wager_fee: 'Камісія стаўкі',
  },
};
