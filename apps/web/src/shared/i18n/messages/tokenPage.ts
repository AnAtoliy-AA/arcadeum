import type { DeepPartial } from '../base-types';

export interface TokenPageMessages {
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
}

export const en: TokenPageMessages = {
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
};

export const ru: DeepPartial<TokenPageMessages> = {
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
};

export const es: DeepPartial<TokenPageMessages> = {
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
};

export const fr: DeepPartial<TokenPageMessages> = {
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
        "Achetez des avatars, des badges, des couleurs de nom et d'autres cosmétiques dans la boutique.",
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
    "Les tokens ARCADEUM sont des actifs utilitaires uniquement pour une utilisation sur la plateforme. Ils n'ont pas de valeur monétaire intrinsèque et ne sont pas des investissements. Tous les achats sont définitifs.",
};

export const by: DeepPartial<TokenPageMessages> = {
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
    "Токены ARCADEUM — гэта ўтылітарныя актывы толькі для выкарыстання на платформе. Яны не маюць унутранай грашовай кошту і не з'яўляюцца інвестыцыямі. Усе пакупкі з'яўляюцца канчатковымі.",
};
