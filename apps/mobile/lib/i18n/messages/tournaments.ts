// Mobile supports en / es / fr only (ru and by are web-only locales).
// Keys mirror the web tournaments namespace (apps/web/src/shared/i18n/messages/pages/en.ts).
// Admin-only keys (markComplete.*) are excluded.
import type { TranslationMap } from '../types';

export const tournamentsMessages = {
  en: {
    title: 'Tournaments',
    loading: 'Loading tournaments…',
    empty: 'No tournaments yet. Check back soon!',
    card: {
      registered: '{count} / {max} registered',
      prize: 'Prize',
      entryFee: 'Entry fee',
      prizePool: 'Prize pool',
      registerCta: 'Register',
      unregisterCta: 'Unregister',
      signInToRegister: 'Sign in to register',
      full: 'Join waitlist',
      registrationClosed: 'Registration closed',
      confirmRegister: {
        title: 'Confirm entry',
        body: 'This tournament costs {fee} coins. Your balance: {balance} coins.',
        confirm: 'Pay & Register',
        cancel: 'Cancel',
      },
      confirmUnregister: {
        refund: "You'll be refunded {amount} coins.",
        title: 'Cancel registration',
        body: 'Are you sure?',
        confirm: 'Yes, cancel',
        cancelButton: 'No, keep me in',
      },
      errors: {
        insufficientFunds: 'Not enough coins to enter.',
      },
      effectiveStatus: {
        scheduled: 'Scheduled',
        registration_open: 'Registration open',
        registration_closed: 'Registration closed',
        live: 'Live',
        awaiting_results: 'Awaiting results',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
      gameType: {
        critical_v1: 'Critical',
        sea_battle_v1: 'Sea Battle',
      },
    },
  },
  es: {
    title: 'Torneos',
    loading: 'Cargando torneos…',
    empty: 'Aún no hay torneos. ¡Vuelve pronto!',
    card: {
      registered: 'Inscritos {count} / {max}',
      prize: 'Premio',
      entryFee: 'Cuota de entrada',
      prizePool: 'Premio en juego',
      registerCta: 'Inscribirse',
      unregisterCta: 'Cancelar inscripción',
      signInToRegister: 'Inicia sesión para inscribirte',
      full: 'Lista de espera',
      registrationClosed: 'Inscripción cerrada',
      confirmRegister: {
        title: 'Confirmar entrada',
        body: 'Este torneo cuesta {fee} monedas. Tu saldo: {balance} monedas.',
        confirm: 'Pagar e inscribirse',
        cancel: 'Cancelar',
      },
      confirmUnregister: {
        refund: 'Se te devolverán {amount} monedas.',
        title: 'Cancelar inscripción',
        body: '¿Estás seguro?',
        confirm: 'Sí, cancelar',
        cancelButton: 'No, mantenerme',
      },
      errors: {
        insufficientFunds: 'No tienes suficientes monedas para participar.',
      },
      effectiveStatus: {
        scheduled: 'Programado',
        registration_open: 'Inscripción abierta',
        registration_closed: 'Inscripción cerrada',
        live: 'En curso',
        awaiting_results: 'Esperando resultados',
        completed: 'Finalizado',
        cancelled: 'Cancelado',
      },
      gameType: {
        critical_v1: 'Critical',
        sea_battle_v1: 'Batalla naval',
      },
    },
  },
  fr: {
    title: 'Tournois',
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
} as const satisfies Pick<TranslationMap, 'en' | 'es' | 'fr'>;
