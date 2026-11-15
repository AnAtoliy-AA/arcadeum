import type { TournamentsI18n } from './en';

export const tournamentsFr: TournamentsI18n = {
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
  list: {
    loading: 'Chargement des tournois…',
    empty: 'Aucun tournoi pour le moment. Revenez bientôt !',
    card: {
      registered: 'Inscrits {count} / {max}',
      prize: 'Prix',
      entryFee: "Frais d'entrée",
      prizePool: 'Cagnotte',
      registerCta: "S'inscrire",
      unregisterCta: 'Se désinscrire',
      signInToRegister: 'Connectez-vous pour vous inscrire',
      full: "Liste d'attente",
      registrationClosed: 'Inscription fermée',
      viewBracket: 'Voir le tableau',
      confirmRegister: {
        title: 'Confirmer la participation',
        body: 'Ce tournoi coûte {fee} pièces. Votre solde : {balance} pièces.',
        confirm: "Payer et s'inscrire",
        cancel: 'Annuler',
      },
      confirmUnregister: {
        refund: 'Vous serez remboursé de {amount} pièces.',
        title: "Annuler l'inscription",
        body: 'Êtes-vous sûr ?',
        confirm: 'Oui, annuler',
        cancelButton: 'Non, rester',
      },
      errors: {
        insufficientFunds: 'Pas assez de pièces pour participer.',
      },
      effectiveStatus: {
        scheduled: 'Programmé',
        registration_open: 'Inscription ouverte',
        registration_closed: 'Inscription fermée',
        live: 'En cours',
        awaiting_results: 'Résultats à venir',
        completed: 'Terminé',
        cancelled: 'Annulé',
      },
      gameType: {
        critical_v1: 'Critical',
        sea_battle_v1: 'Bataille navale',
      },
    },
  },
  bracket: {
    title: 'Tableau',
    loading: 'Chargement du tableau…',
    empty: "Le tableau n'a pas encore été généré.",
    tbd: 'TBD',
    winner: 'Vainqueur',
    backToList: 'Retour aux tournois',
    errors: {
      locked: 'Le tableau est verrouillé : des résultats ont déjà été saisis.',
      notEnoughPlayers: 'Pas assez de joueurs pour générer le tableau.',
    },
  },
  blitzBanner: {
    ariaLabel: 'Coupe Hebdomadaire Blitz Bataille Navale',
    kicker: 'Championnat Naval Hebdomadaire',
    statusLive: 'Coupe en Direct en Cours',
    statusOpen: 'Inscriptions Ouvertes',
    statusClosed: 'Inscriptions Clôturées',
    statusUpcoming: 'Prochaine Coupe',
    statusRegistered: 'Inscrit',
    formatDetails: '{count} Capitaines • Élimination Directe',
    captainsReady: 'Capitaines Prêts',
    startsIn: 'Début Dans',
    battleStatus: 'Statut du Combat',
    playingNow: 'EN COURS',
    signInNotice: 'Connectez-vous pour rejoindre la Coupe Blitz',
    leaveCup: 'Quitter la Coupe Blitz',
    registerCup: 'Rejoindre la Coupe Blitz',
    tournamentFull: 'Tournoi Complet',
    viewBracket: 'Voir le Tableau',
    allTournaments: 'Tous les Tournois',
    openModal: 'Inspecter Tableau et Capitaines',
    modalTitle: 'Coupe Blitz Bataille Navale',
    tabBracket: 'Tableau du Tournoi',
    tabRoster: 'Liste des Capitaines',
    tabIntel: 'Règles et Infos',
    bracketPendingTitle: 'Tirage du Tableau Bientôt',
    bracketPendingDesc:
      'Le tableau du tournoi sera généré automatiquement dès la clôture des inscriptions. La bataille débutera à l heure prévue.',
    rosterTitle: 'Commandants Inscrits',
    rosterSubtitle: '{count} sur {max} postes occupés',
    rosterWaitlist: 'Liste d attente',
    rosterYou: 'Votre Poste de Combat',
    rosterEmpty:
      'Aucun capitaine inscrit pour le moment. Soyez le premier à vous déployer !',
    captainSeed: 'Tête de série #{seed}',
    intelFormat: 'Format du Tournoi',
    intelFormatDesc:
      'Combat naval à élimination directe. Gagnez pour progresser dans le tableau jusqu à la grande finale.',
    intelFleet: 'Déploiement de Flotte',
    intelFleetDesc:
      'Grille navale classique 10x10 avec 5 navires (Porte-avions, Cuirassé, Croiseur, Sous-marin, Destroyer).',
    intelClock: 'Chrono de Tour',
    intelClockDesc:
      'Chrono rapide de 30 secondes par tour avec mode salve automatique.',
    intelRewards: 'Récompenses du Championnat',
    intelRewardsDesc:
      'Le vainqueur du tournoi reçoit 500 pièces, le prestigieux Trophée d Amiral et une place au sommet du classement.',
    fullPageView: 'Ouvrir la Page du Tournoi',
    closeModal: 'Fermer',
  },
};
