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
  tokenPage: {
    heroBadge: string;
    viewWallet: string;
    marketCap: string;
    totalSupply: string;
    created: string;
    howToEarn: {
      title: string;
      subtitle: string;
      tournamentPrizes: {
        title: string;
        description: string;
      };
    };
    howToSpend: {
      title: string;
      subtitle: string;
      shopItems: {
        title: string;
        description: string;
      };
      profileCustomization: {
        title: string;
        description: string;
      };
      connectWallet: {
        title: string;
        description: string;
      };
    };
    community: {
      title: string;
      subtitle: string;
    };
    disclaimer: string;
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
  tokenPage: {
    heroBadge: 'Solana Token',
    viewWallet: 'View Wallet',
    marketCap: 'Market Cap',
    totalSupply: 'Total Supply',
    created: 'Created',
    howToEarn: {
      title: 'How to Earn',
      subtitle: 'Get ARC tokens through the platform',
      tournamentPrizes: {
        title: 'Tournament Prizes',
        description:
          'Win ARC tokens as prizes in skill-based tournaments. Top performers earn tokens for their achievements.',
      },
    },
    howToSpend: {
      title: 'How to Spend',
      subtitle: 'Use your tokens to customize your profile and stand out',
      shopItems: {
        title: 'Shop Items',
        description:
          'Purchase avatars, badges, name colors, and other cosmetics from the shop.',
      },
      profileCustomization: {
        title: 'Profile Customization',
        description:
          'Equip your purchased items to personalize your profile and stand out in matches.',
      },
      connectWallet: {
        title: 'Connect Wallet',
        description:
          'Connect your Phantom wallet and send ARC tokens to use them for shop purchases on the platform.',
      },
    },
    community: {
      title: 'Community',
      subtitle: 'Join our community and stay updated',
    },
    disclaimer:
      'ARCADEUM tokens are utility assets for in-platform use only. They have no inherent monetary value and are not investments. All purchases are final.',
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
  tokenPage: {
    heroBadge: 'Токен Solana',
    viewWallet: 'Посмотреть кошелёк',
    marketCap: 'Рыночная капитализация',
    totalSupply: 'Общее предложение',
    created: 'Создано',
    howToEarn: {
      title: 'Как заработать',
      subtitle: 'Получайте токены ARC через платформу',
      tournamentPrizes: {
        title: 'Призы турниров',
        description:
          'Выигрывайте токены ARC в качестве призов в турнирах на основе навыков. Лучшие игроки получают токены за свои достижения.',
      },
    },
    howToSpend: {
      title: 'Как потратить',
      subtitle: 'Используйте токены для настройки профиля и выделения',
      shopItems: {
        title: 'Товары магазина',
        description:
          'Покупайте аватары, значки, цвета имён и другие косметические товары в магазине.',
      },
      profileCustomization: {
        title: 'Настройка профиля',
        description:
          'Экипируйте купленные товары для персонализации профиля и выделения в матчах.',
      },
      connectWallet: {
        title: 'Подключить кошелёк',
        description:
          'Подключите кошелёк Phantom и отправьте токены ARC для использования в покупках на платформе.',
      },
    },
    community: {
      title: 'Сообщество',
      subtitle: 'Присоединяйтесь к нашему сообществу и будьте в курсе',
    },
    disclaimer:
      'Токены ARCADEUM — это утилитарные активы для использования только на платформе. Они не имеют внутренней денежной ценности и не являются инвестициями. Все покупки являются окончательными.',
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
  tokenPage: {
    heroBadge: 'Token Solana',
    viewWallet: 'Ver Monedero',
    marketCap: 'Capitalización de Mercado',
    totalSupply: 'Suministro Total',
    created: 'Creado',
    howToEarn: {
      title: 'Cómo Ganar',
      subtitle: 'Obtén tokens ARC a través de la plataforma',
      tournamentPrizes: {
        title: 'Premios de Torneos',
        description:
          'Gana tokens ARC como premios en torneos basados en habilidad. Los mejores jugadores obtienen tokens por sus logros.',
      },
    },
    howToSpend: {
      title: 'Cómo Gastar',
      subtitle: 'Usa tus tokens para personalizar tu perfil y destacar',
      shopItems: {
        title: 'Artículos de Tienda',
        description:
          'Compra avatares, insignias, colores de nombre y otros cosméticos en la tienda.',
      },
      profileCustomization: {
        title: 'Personalización de Perfil',
        description:
          'Equipa tus artículos comprados para personalizar tu perfil y destacar en los partidos.',
      },
      connectWallet: {
        title: 'Conectar Monedero',
        description:
          'Conecta tu monedero Phantom y envía tokens ARC para usarlos en compras en la plataforma.',
      },
    },
    community: {
      title: 'Comunidad',
      subtitle: 'Únete a nuestra comunidad y mantente actualizado',
    },
    disclaimer:
      'Los tokens ARCADEUM son activos utilitarios solo para uso en la plataforma. No tienen valor monetario inherente y no son inversiones. Todas las compras son finales.',
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
  tokenPage: {
    heroBadge: 'Token Solana',
    viewWallet: 'Voir le Portefeuille',
    marketCap: 'Capitalisation Boursière',
    totalSupply: 'Offre Totale',
    created: 'Créé',
    howToEarn: {
      title: 'Comment Gagner',
      subtitle: 'Obtenez des tokens ARC via la plateforme',
      tournamentPrizes: {
        title: 'Prix de Tournois',
        description:
          'Gagnez des tokens ARC comme prix dans les tournois basés sur les compétences. Les meilleurs joueurs reçoivent des tokens pour leurs performances.',
      },
    },
    howToSpend: {
      title: 'Comment Dépenser',
      subtitle: 'Utilisez vos tokens pour personnaliser votre profil et vous démarquer',
      shopItems: {
        title: 'Articles de Boutique',
        description:
          'Achetez des avatars, des badges, des couleurs de nom et d\'autres cosmétiques dans la boutique.',
      },
      profileCustomization: {
        title: 'Personnalisation du Profil',
        description:
          'Équipez vos articles achetés pour personnaliser votre profil et vous démarquer dans les matchs.',
      },
      connectWallet: {
        title: 'Connecter le Portefeuille',
        description:
          'Connectez votre portefeuille Phantom et envoyez des tokens ARC pour les utiliser dans les achats sur la plateforme.',
      },
    },
    community: {
      title: 'Communauté',
      subtitle: 'Rejoignez notre communauté et restez informé',
    },
    disclaimer:
      'Les tokens ARCADEUM sont des actifs utilitaires uniquement pour une utilisation sur la plateforme. Ils n\'ont pas de valeur monétaire intrinsèque et ne sont pas des investissements. Tous les achats sont définitifs.',
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
  tokenPage: {
    heroBadge: 'Токен Solana',
    viewWallet: 'Паглядзець кашалёк',
    marketCap: 'Рыначная капіталізацыя',
    totalSupply: 'Агульная прапанова',
    created: 'Створана',
    howToEarn: {
      title: 'Як зарабіць',
      subtitle: 'Атрымлівайце токены ARC праз платформу',
      tournamentPrizes: {
        title: 'Прызы турніраў',
        description:
          'Выйгравайце токены ARC у якасці прызаў у турнірах, заснаваных на навыках. Лепшыя гульцы атрымліваюць токены за свае дасягненні.',
      },
    },
    howToSpend: {
      title: 'Як патраціць',
      subtitle: 'Выкарыстоўвайце токены для налады прафіля і вылучэння',
      shopItems: {
        title: 'Тавары крамы',
        description:
          'Купляйце аватары, значкі, колеры імёнаў і іншыя касметычныя тавары ў краме.',
      },
      profileCustomization: {
        title: 'Налада прафіля',
        description:
          'Экіпіруйце купленыя тавары для персаналізацыі прафіля і вылучэння ў матчах.',
      },
      connectWallet: {
        title: 'Падключыць кашалёк',
        description:
          'Падключыце кашалёк Phantom і адпраўце токены ARC для выкарыстання ў пакупках на платформе.',
      },
    },
    community: {
      title: 'Суполка',
      subtitle: 'Далучайцеся да нашай суполкі і будзеце ў курсе',
    },
    disclaimer:
      'Токены ARCADEUM — гэта ўтылітарныя актывы толькі для выкарыстання на платформе. Яны не маюць унутранай грашовай кошту і не з\'яўляюцца інвестыцыямі. Усе пакупкі з\'яўляюцца канчатковымі.',
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
