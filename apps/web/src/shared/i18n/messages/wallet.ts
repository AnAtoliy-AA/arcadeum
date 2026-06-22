import type { DeepPartial } from '../base-types';

export interface WalletMessages {
  balance: {
    title: string;
    subtitle: string;
    coins: string;
    gems: string;
    arcadeum: string;
  };
  tokenInfo: {
    name: string;
    ticker: string;
    description: string;
    mint: string;
    copy: string;
    copied: string;
  };
  history: {
    filterAll: string;
    filterCoins: string;
    filterGems: string;
    filterArcadeum: string;
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
    shop_purchase_arc: string;
    shop_sell_refund: string;
    battle_pass_reward: string;
    achievement: string;
    daily_challenge: string;
    token_purchase: string;
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
  tokenInfo: {
    name: 'ARCADEUM GAMES',
    ticker: 'ARC',
    description:
      '{{name}} ({{ticker}}) is a token on the Solana blockchain. Earn tokens through gameplay or tournament prizes.',
    mint: 'Mint',
    copy: 'Copy',
    copied: 'Copied!',
  },
  history: {
    filterAll: 'All',
    filterCoins: 'Coins',
    filterGems: 'Gems',
    filterArcadeum: 'Arcadeum',
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
    shop_purchase_arc: 'Shop purchase (ARC)',
    shop_sell_refund: 'Shop sell refund',
    battle_pass_reward: 'Battle pass reward',
    achievement: 'Achievement',
    daily_challenge: 'Daily challenge',
    token_purchase: 'Token purchase',
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
  tokenInfo: {
    name: 'ARCADEUM GAMES',
    ticker: 'ARC',
    description:
      '{{name}} ({{ticker}}) — токен на блокчейне Solana. Зарабатывайте токены в игре или призовые в турнирах.',
    mint: 'Минт',
    copy: 'Копировать',
    copied: 'Скопировано!',
  },
  history: {
    filterAll: 'Все',
    filterCoins: 'Монеты',
    filterGems: 'Гемы',
    filterArcadeum: 'Arcadeum',
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
    shop_purchase_arc: 'Покупка в магазине (ARC)',
    shop_sell_refund: 'Возврат продажи',
    battle_pass_reward: 'Награда боевого пропуска',
    achievement: 'Достижение',
    daily_challenge: 'Ежедневное задание',
    token_purchase: 'Покупка токенов',
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
  tokenInfo: {
    name: 'ARCADEUM GAMES',
    ticker: 'ARC',
    description:
      '{{name}} ({{ticker}}) es un token en la blockchain de Solana. Gana tokens jugando o en premios de torneos.',
    mint: 'Mint',
    copy: 'Copiar',
    copied: '¡Copiado!',
  },
  history: {
    filterAll: 'Todos',
    filterCoins: 'Monedas',
    filterGems: 'Gemas',
    filterArcadeum: 'Arcadeum',
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
    shop_purchase_arc: 'Compra en tienda (ARC)',
    shop_sell_refund: 'Reembolso de venta',
    battle_pass_reward: 'Recompensa de pase de batalla',
    achievement: 'Logro',
    daily_challenge: 'Desafío diario',
    token_purchase: 'Compra de tokens',
    tournament_token_prize: 'Premio de tokens en torneo',
    wager_entry: 'Apuesta',
    wager_prize: 'Premio de apuesta',
    wager_fee: 'Comisión de apuesta',
  },
};

export const fr: DeepPartial<WalletMessages> = {
  balance: {
    title: 'Votre Portefeuille',
    subtitle: 'Les pièces sont gagnées en jouant. Les gemmes sont achetées.',
    coins: 'Pièces',
    gems: 'Gemmes',
    arcadeum: 'ARCADEUM',
  },
  tokenInfo: {
    name: 'ARCADEUM GAMES',
    ticker: 'ARC',
    description:
      '{name} ({ticker}) est un token sur la blockchain Solana. Gagnez des tokens en jouant ou en prix de tournois.',
    mint: 'Mint',
    copy: 'Copier',
    copied: 'Copié !',
  },
  history: {
    filterAll: 'Tout',
    filterCoins: 'Pièces',
    filterGems: 'Gemmes',
    filterArcadeum: 'Arcadeum',
    emptyTitle: 'Aucune transaction pour le moment',
    emptyDescription: "L'activité de votre portefeuille apparaîtra ici.",
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
    shop_purchase_arc: 'Achat en boutique (ARC)',
    shop_sell_refund: 'Remboursement de vente',
    battle_pass_reward: 'Récompense du pass de bataille',
    achievement: 'Succès',
    daily_challenge: 'Défi quotidien',
    token_purchase: 'Achat de tokens',
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
  tokenInfo: {
    name: 'ARCADEUM GAMES',
    ticker: 'ARC',
    description:
      '{name} ({ticker}) — токен на блокчейне Solana. Зарабляйце токены ў гульні або прызавыя ў турнірах.',
    mint: 'Мінт',
    copy: 'Капіяваць',
    copied: 'Скапіявана!',
  },
  history: {
    filterAll: 'Усе',
    filterCoins: 'Манеты',
    filterGems: 'Гемы',
    filterArcadeum: 'Arcadeum',
    emptyTitle: 'Пакуль няма транзакцый',
    emptyDescription: "Актыўнасць вашага кашалька з'явіцца тут.",
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
    shop_purchase_arc: 'Пакупка ў краме (ARC)',
    shop_sell_refund: 'Вяртанне продажу',
    battle_pass_reward: 'Узнагарода баявога пропуску',
    achievement: 'Дасягненне',
    daily_challenge: 'Штодзённае заданне',
    token_purchase: 'Пакупка токенаў',
    tournament_token_prize: 'Прыз турніру ў токенах',
    wager_entry: 'Стаўка',
    wager_prize: 'Выйгрыш стаўкі',
    wager_fee: 'Камісія стаўкі',
  },
};
