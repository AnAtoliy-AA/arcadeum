import { adminAnnouncementsFr } from './admin-announcements/fr';

export const fr = {
  admin: {
    title: 'Administration',
    welcome: "Bienvenue dans l'espace administrateur",
    welcomeBody:
      'Les panneaux apparaîtront ici au fur et à mesure de leur publication. Utilisez la barre latérale pour naviguer.',
    signedInAs: 'Connecté en tant que {username}',
    nav: {
      dashboard: 'Tableau de bord',
      users: 'Utilisateurs',
      payments: 'Paiements',
      announcements: 'Annonces',
      tournaments: 'Tournois',
      comingSoon: 'Bientôt',
    },
    error: {
      title: "Une erreur s'est produite",
      body: 'Une erreur est survenue lors du chargement de cette page.',
      retry: 'Réessayer',
    },
    users: {
      title: 'Utilisateurs',
      search: {
        placeholder: "Recherche par nom d'utilisateur, email ou nom",
      },
      filter: {
        role: { all: 'Tous les rôles', placeholder: 'Filtrer par rôle' },
      },
      table: {
        username: "Nom d'utilisateur",
        email: 'Email',
        role: 'Rôle',
        createdAt: 'Créé le',
        actions: 'Actions',
      },
      empty: {
        noResults: 'Aucun utilisateur ne correspond aux filtres.',
        noUsers: 'Aucun utilisateur pour le moment.',
      },
      pagination: {
        prev: 'Précédent',
        next: 'Suivant',
        of: 'Page {current} sur {total}',
      },
      totalLabel: '{total} utilisateurs',
      selfTooltip: 'Vous ne pouvez pas changer votre propre rôle.',
      role: {
        free: 'Gratuit',
        premium: 'Premium',
        vip: 'VIP',
        supporter: 'Soutien',
        moderator: 'Modérateur',
        tester: 'Testeur',
        developer: 'Développeur',
        admin: 'Admin',
      },
      errors: {
        SELF_ROLE_CHANGE_FORBIDDEN:
          'Vous ne pouvez pas changer votre propre rôle.',
        LAST_ADMIN_PROTECTED:
          'Impossible de rétrograder le dernier administrateur.',
        USER_NOT_FOUND: 'Utilisateur introuvable.',
        INVALID_USER_ID: 'Identifiant utilisateur invalide.',
        generic: "Quelque chose s'est mal passé. Veuillez réessayer.",
      },
    },
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
  },
  tournaments: {
    title: 'Tournois',
    subtitle: 'Affrontez les meilleurs joueurs du monde',
    description:
      'Participez à des tournois passionnants, progressez dans les brackets et disputez des prix exclusifs. De nouveaux tournois sont ajoutés régulièrement.',
    features: [
      {
        title: 'Brackets dynamiques',
        description:
          'Suivez vos progrès grâce à des tableaux mis à jour en temps réel.',
      },
      {
        title: 'Récompenses exclusives',
        description:
          'Gagnez des cosmétiques premium, des boosters et des récompenses saisonnières.',
      },
      {
        title: 'Matchmaking par niveau',
        description:
          'Affrontez des joueurs de niveau similaire pour une expérience équilibrée.',
      },
    ],
    comingSoon: "Le mode tournoi arrive bientôt. Restez à l'écoute !",
  },
  blog: {
    title: 'Blog de Jeux',
    subtitle: 'Actualités, conseils et histoires de la communauté',
    description:
      'Restez informé des derniers guides, annonces, conseils stratégiques et histoires de joueurs du monde entier.',
    features: [
      {
        title: 'Dernières nouvelles',
        description:
          'Soyez le premier informé des nouveaux jeux, fonctionnalités et mises à jour.',
      },
      {
        title: 'Conseils de pro',
        description:
          'Apprenez des stratégies avancées grâce aux meilleurs joueurs de la communauté.',
      },
      {
        title: 'Histoires vécues',
        description:
          'Découvrez les expériences et les réussites de nos joueurs les plus dévoués.',
      },
    ],
    comingSoon: 'Les articles arrivent bientôt !',
  },
  community: {
    title: 'Rejoindre la Communauté',
    subtitle: 'Connectez-vous avec des joueurs du monde entier',
    description:
      'Partagez des stratégies, participez à des événements communautaires et faites des amis qui aiment les jeux de société autant que vous.',
    sections: {
      discord: {
        title: 'Discord',
        description:
          "Rejoignez notre communauté active sur Discord pour discuter des jeux, signaler des bogues et rencontrer d'autres joueurs.",
      },
      twitter: {
        title: 'Twitter / X',
        description:
          'Suivez-nous pour les dernières nouvelles, mises à jour et annonces.',
      },
      github: {
        title: 'Github',
        description:
          'Arcadeum est open-source. Contribuez au projet sur Github.',
      },
    },
    comingSoon: 'La communauté arrive bientôt !',
  },
  cookies: {
    title: 'Politique de Cookies',
    lastUpdated: 'Dernière mise à jour : 25 mars 2026',
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
  developers: {
    title: 'Développeurs',
    subtitle: 'Construisez sur la plateforme Arcadeum',
    description:
      'Explorez nos APIs et outils pour développeurs. Documentation complète et accès sandbox disponibles prochainement.',
    features: [
      {
        title: 'APIs RESTful',
        description:
          "Accédez aux données des joueurs, à l'historique et aux classements.",
      },
      {
        title: 'Événements WebSocket',
        description:
          'Intégrez des mises à jour en temps réel dans vos propres applications.',
      },
      {
        title: 'Environnement Sandbox',
        description:
          'Testez vos intégrations en toute sécurité avant la mise en production.',
      },
    ],
    comingSoon: 'Le portail développeurs arrive bientôt !',
  },
  help: {
    title: "Centre d'aide",
    subtitle: 'Trouvez des réponses à vos questions',
    description:
      'Consultez des articles sur le gameplay, la gestion de compte, la facturation et plus encore. Notre équipe de support est prête à vous aider.',
    features: [
      {
        title: 'FAQ complète',
        description:
          'Trouvez rapidement des réponses grâce à notre base de connaissances.',
      },
      {
        title: 'Support direct',
        description:
          'Ouvrez un ticket et recevez une aide personnalisée de notre équipe.',
      },
      {
        title: 'Aide communautaire',
        description:
          "Échangez avec d'autres joueurs pour obtenir des conseils de dépannage.",
      },
    ],
    comingSoon: "Le centre d'aide arrive bientôt.",
  },
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
      critical: {
        name: 'Critical',
        subtitle: 'Cartes à enjeux',
        icon: '♠',
      },
      sea_battle: {
        name: 'Bataille navale',
        subtitle: 'Stratégie navale',
        icon: '⚓',
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
  rewards: {
    title: 'Récompenses',
    subtitle: 'Gagnez des bonus exclusifs en jouant',
    description:
      'Notre programme de récompenses est conçu pour remercier nos joueurs les plus actifs. Gagnez des points pour chaque match et échangez-les contre des objets premium.',
    features: [
      {
        title: 'Bonus quotidiens',
        description:
          'Connectez-vous chaque jour pour réclamer votre récompense.',
      },
      {
        title: 'Pass saisonniers',
        description:
          'Débloquez des récompenses en participant aux événements de saison.',
      },
      {
        title: 'Programme de parrainage',
        description:
          'Invitez vos amis et gagnez des bonus pour chaque nouveau joueur.',
      },
    ],
    comingSoon: 'La boutique de récompenses arrive bientôt !',
  },
};
