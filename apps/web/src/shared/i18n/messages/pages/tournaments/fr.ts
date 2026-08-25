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
};
