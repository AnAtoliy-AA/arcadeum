import { tournamentsFr } from './tournaments/fr';
import { helpFr } from './help/fr';
import { adminAnnouncementsFr } from './admin-announcements/fr';
import { adminTournamentsFr } from './admin-tournaments/fr';
import { walletFr } from './wallet/fr';
import { adminWalletFr } from './admin-wallet/fr';
import { gemsFr } from './gems/fr';
import { adminGemPackagesFr } from './admin-gem-packages/fr';
import { adminEconomyFr } from './admin-economy/fr';
import { adminStatisticsFr } from './admin-statistics/fr';
import { dailyRewardsFr } from './daily-rewards/fr';
import { dailyChallengesFr } from './daily-challenges/fr';
import { achievementsFr } from './achievements/fr';
import { shopFr } from './shop/fr';
import { adminShopFr } from './admin-shop/fr';
import { adminGamesFr } from './admin-games/fr';
import { adminBlockedIpsFr } from './admin-blocked-ips/fr';
import { adminUsersFr } from './admin-users/fr';
import { adminBulkRewardsFr } from './admin-bulk-rewards/fr';
import { friendsFr } from './friends/fr';
import { clansFr } from './clans/fr';
import { eventsFr } from './events/fr';
import { seasonsFr } from './seasons/fr';
import { communityFr } from './community/fr';
import { rewardsFr } from './rewards/fr';
import { developersFr } from './developers/fr';
import { blogFr } from './blog/fr';
import { changelogFr } from './changelog/fr';
import { featuresFr } from './features/fr';
import { roadmapFr } from './roadmap/fr';

export const fr = {
  admin: {
    title: 'Administration',
    welcome: "Bienvenue dans l'espace administrateur",
    welcomeBody:
      'Les panneaux apparaîtront ici au fur et à mesure de leur publication. Utilisez la barre latérale pour naviguer.',
    signedInAs: 'Connecté en tant que {username}',
    nav: {
      dashboard: 'Tableau de bord',
      statistics: 'Statistiques',
      users: 'Utilisateurs',
      payments: 'Paiements',
      announcements: 'Annonces',
      tournaments: 'Tournois',
      economy: 'Économie',
      shop: 'Boutique',
      gemPackages: 'Packs de Gemmes',
      games: 'Jeux',
      gameRules: 'Règles du Jeu',
      bulkRewards: 'Récompenses en Masse',
      blockedIps: 'IPs Bloqués',
      geoBlock: 'Géo-Blocage',
      comingSoon: 'Bientôt',
    },
    statistics: adminStatisticsFr,
    dashboard: {
      title: 'Centre de Commandement',
      subtitle:
        "Santé du système, indicateurs clés et vue d'ensemble des modules d'administration",
      systemHealth: 'Santé du Système',
      statusOnline: 'Opérationnel',
      statusDegraded: 'Dégradé',
      database: 'Base de données',
      collections: 'Collections',
      totalDocuments: 'Documents Totaux',
      dataSize: 'Taille des données (Mo)',
      storageSize: 'Taille du stockage (Mo)',
      indexSize: 'Taille des index (Mo)',
      activeModules: 'Modules Actifs',
      modulesTitle: "Modules d'Administration",
      modulesSubtitle:
        'Accès direct pour gérer jeux, joueurs, transactions et sécurité',
      modules: {
        statistics: {
          title: 'Analytique de la Plateforme',
          description:
            'Consultez MAU, DAU, rétention, temps de jeu et revenus des gemmes',
        },
        users: {
          title: 'Gestion des Utilisateurs',
          description:
            'Gérer les comptes joueurs, rôles, statuts et exclusions',
        },
        payments: {
          title: 'Paiements et Notes',
          description:
            'Consulter les relevés de paiement, transactions et notes',
        },
        tournaments: {
          title: 'Tournois',
          description:
            'Programmer et gérer les tournois compétitifs et cagnottes',
        },
        gemPackages: {
          title: 'Packs de Gemmes',
          description: 'Configurer les paliers de gemmes, tarifs et bonus',
        },
        shop: {
          title: 'Boutique et Cosmétiques',
          description:
            "Gérer l'inventaire, raretés cosmétiques et attributions",
        },
        economy: {
          title: 'Économie et Trésorerie',
          description: 'Surveiller la circulation des jetons, robinet et flux',
        },
        bulkRewards: {
          title: 'Récompenses en Masse',
          description: 'Distribuer des devises à des cohortes de joueurs',
        },
        games: {
          title: 'Visibilité des Jeux',
          description:
            'Contrôler la disponibilité et le statut des modes de jeu',
        },
        gameRules: {
          title: 'Règles du Jeu',
          description:
            'Configurer les variantes, chronomètres de tours et mécaniques',
        },
        announcements: {
          title: 'Annonces',
          description: 'Diffuser des alertes globales et avis de maintenance',
        },
        blockedIps: {
          title: 'IPs Bloqués',
          description: 'Inspecter et bannir les adresses IP malveillantes',
        },
        geoBlock: {
          title: 'Géo-Blocage',
          description:
            'Configurer les restrictions juridictionnelles et territoriales',
        },
      },
      openPanel: 'Ouvrir le Panneau',
      collectionsOverview: 'Détail des Collections de la Base de Données',
      collectionName: 'Collection',
      docsCount: 'Documents',
      sizeMb: 'Taille (Mo)',
      avgDocSize: 'Taille Moyenne',
      indexesCount: 'Index',
      liveStatus: 'Statut en Direct',
      environment: 'Environnement',
    },
    error: {
      title: "Une erreur s'est produite",
      body: 'Une erreur est survenue lors du chargement de cette page.',
      retry: 'Réessayer',
    },
    users: adminUsersFr,
    payments: {
      title: 'Paiements',
      search: { placeholder: 'Recherche par note, nom ou ID de transaction' },
      filter: {
        visibility: {
          label: 'Visibilité',
          all: 'Tous',
          public: 'Publics seulement',
          private: 'Privés seulement',
        },
      },
      table: {
        user: 'Utilisateur',
        amount: 'Montant',
        note: 'Note',
        visibility: 'Visibilité',
        createdAt: 'Créé le',
        transactionId: 'Transaction',
      },
      chip: { public: 'Public', private: 'Privé', anonymous: 'Anonyme' },
      empty: {
        noResults: 'Aucun paiement ne correspond aux filtres.',
        noNotes: 'Aucun paiement pour le moment.',
      },
      pagination: {
        prev: 'Précédent',
        next: 'Suivant',
        of: 'Page {current} sur {total}',
      },
      totalLabel: '{total} notes',
    },
    announcements: adminAnnouncementsFr,
    tournaments: adminTournamentsFr,
    wallet: adminWalletFr,
    blockedIps: adminBlockedIpsFr,
    bulkRewards: adminBulkRewardsFr,
  },
  tournaments: tournamentsFr,
  blog: blogFr,
  community: communityFr,
  cookies: {
    title: 'Politique de Cookies',
    lastUpdated: 'Dernière mise à jour : 16 août 2026',
    sections: {
      whatAreCookies: {
        title: 'Que sont les cookies ?',
        content:
          'Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez notre plateforme. Ils nous aident à mémoriser vos préférences et à vous garder connecté.',
      },
      howWeUse: {
        title: 'Comment nous utilisons les cookies',
        intro: 'Nous utilisons des cookies aux fins suivantes :',
        items: [
          'Cookies essentiels — nécessaires au bon fonctionnement de la plateforme.',
          'Cookies de préférences — mémorisent votre langue, thème et paramètres.',
          'Cookies analytiques — nous aident à améliorer la plateforme.',
        ],
      },
      thirdParty: {
        title: 'Cookies tiers',
        content:
          "Nous n'utilisons pas de cookies pour le suivi sur des sites tiers.",
      },
      managing: {
        title: 'Gestion des cookies',
        content:
          'Vous pouvez désactiver ou supprimer les cookies via les paramètres de votre navigateur à tout moment.',
      },
      contact: {
        title: 'Des questions ?',
        content:
          "Si vous avez des questions sur notre utilisation des cookies, contactez-nous via notre page d'assistance.",
      },
    },
  },
  developers: developersFr,
  help: helpFr,
  leaderboards: {
    title: 'Classements',
    subtitle: 'Voyez où vous vous situez parmi les meilleurs joueurs',
    description:
      'Suivez votre position dans tous les jeux, comparez vos statistiques avec vos amis et suivez les meilleurs joueurs. Les classements se mettent à jour en temps réel.',
    live: 'En direct',
    capturedAt: 'Capturé {time}',
    hero: {
      eyebrow: 'En direct · Saison 4',
      title: 'Course au classement.',
      tagline: 'Mis à jour toutes les 30 secondes. Le top 100 vise la Coupe.',
    },
    ticker: { live: 'En direct' },
    modes: {
      all: { name: 'Tous les jeux', subtitle: 'Classement combiné', icon: '◎' },
      critical_v1: {
        name: 'Critique',
        subtitle: 'Cartes à enjeux',
        icon: '♠',
      },
      sea_battle_v1: {
        name: 'Bataille navale',
        subtitle: 'Stratégie navale',
        icon: '⚓',
      },
      texas_holdem_v1: {
        name: "Texas Hold'em Poker",
        subtitle: 'Tables de poker',
        icon: '♣',
      },
      glimworm_v1: { name: 'Glimworm', subtitle: 'Arène serpent', icon: '🐍' },
      tic_tac_toe_v1: {
        name: 'Morpion',
        subtitle: 'Morpion classique',
        icon: '✕',
      },
      cascade_v1: {
        name: 'Cascade',
        subtitle: 'Cascade de cartes',
        icon: '▥',
      },
      chess_v1: { name: 'Échecs', subtitle: 'Stratégie classique', icon: '♞' },
      checkers_v1: {
        name: 'Dames',
        subtitle: 'Classique de plateau',
        icon: '●',
      },
      cat_dash_v1: {
        name: 'Cat Dash',
        subtitle: 'Course de chats',
        icon: '🐱',
      },
      backgammon_v1: {
        name: 'Backgammon',
        subtitle: 'Stratégie de plateau',
        icon: '🎲',
      },
    },
    cup: {
      eyebrow: 'Tournoi',
      title: "Coupe d'automne",
      endsIn: 'Se termine dans',
      prizePool: 'Cagnotte',
      participants: 'Participants',
      qualifiedLabel: 'Qualifiés',
      comingSoon: 'Bientôt disponible',
      comingSoonBody:
        'Les tournois en direct et les cagnottes arrivent bientôt.',
    },
    mythic: {
      label: 'Mythique',
      streak: 'Série de {count} parties',
      leadOver: "+{delta} d'avance sur #2",
      recentLabel: '12 dernières parties',
      challenge: '⚔ Défier',
      watch: '▶ Voir le replay',
      follow: 'Suivre',
      runnerUp: 'Vice-champion',
      thirdPlace: 'Troisième',
    },
    controls: {
      global: 'Mondial',
      perGame: 'Par jeu',
      tournaments: 'Tournois',
      friends: 'Amis',
      regional: 'Régional',
      searchPlaceholder: 'Trouver un joueur…',
      jumpToMe: '↓ Aller à moi',
      ranges: {
        today: "Aujourd'hui",
        week: 'Semaine',
        month: 'Mois',
        season: 'Saison',
      },
    },
    table: {
      rank: '#',
      player: 'Joueur',
      region: 'Région',
      rating: 'Score',
      record: 'V–D–N',
      winrate: 'Ratio',
      form: 'Forme',
      trend: 'Tendance',
    },
    trend: {
      up: 'Hausse de {n}',
      down: 'Baisse de {n}',
      same: 'Inchangé',
    },
    climbers: { title: 'Plus fortes hausses' },
    fallers: { title: 'Plus fortes baisses' },
    squads: { title: 'Meilleures équipes', members: '{count} membres' },
    regions: {
      title: 'Par région',
      na: 'Amérique du Nord',
      eu: 'Europe',
      sa: 'Amérique du Sud',
      asia: 'Asie',
      oceania: 'Océanie',
      africa: 'Afrique',
      me: 'Moyen-Orient',
    },
    rewards: {
      title: 'Échelle des récompenses',
      mythic: "Couronne mythique + 12k d'or",
      diamond: "Éclat de diamant + 6k d'or",
      platinum: "Trophée platine + 3k d'or",
      gold: "1k d'or + cosmétique",
    },
    self: {
      pinned: 'Votre rang',
      unranked: 'Non classé — jouez 5 parties classées pour apparaître',
      share: 'Partager',
    },
    loadMore: 'Charger plus',
    freshness: {
      updatedAt: 'Mis à jour {ago}',
      justNow: "à l'instant",
      secondsAgo: 'il y a {n} s',
      minutesAgo: 'il y a {n} min',
      hoursAgo: 'il y a {n} h',
    },
    profile: {
      eyebrow: 'Joueur',
      placeholder:
        "Profil complet avec historique du score, parties récentes et infos d'équipe à venir.",
      back: 'Retour au classement',
    },
    empty: {
      title: 'Aucun classement pour le moment',
      body: 'Soyez le premier à grimper.',
    },
    errorState: {
      title: 'Impossible de charger le classement',
      retry: 'Réessayer',
    },
    features: [
      {
        title: "Classement d'amis",
        description:
          'Comparez vos résultats avec vos amis et défiez-les pour la première place.',
      },
      {
        title: 'Classements mondiaux',
        description: 'Disputez la première place mondiale sur tous nos jeux.',
      },
      {
        title: 'Historique des saisons',
        description:
          'Passez en revue vos performances passées et voyez votre progression.',
      },
    ],
    comingSoon: 'Les classements mondiaux arrivent bientôt !',
  },
  rewards: rewardsFr,
  wallet: walletFr,
  gems: gemsFr,
  adminGemPackages: adminGemPackagesFr,
  adminEconomy: adminEconomyFr,
  dailyRewards: dailyRewardsFr,
  dailyChallenges: dailyChallengesFr,
  achievements: achievementsFr,
  shop: shopFr,
  adminShop: adminShopFr,
  adminGames: adminGamesFr,
  friends: friendsFr,
  clans: clansFr,
  events: eventsFr,
  seasons: seasonsFr,
  changelog: changelogFr,
  features: featuresFr,
  roadmap: roadmapFr,
};
