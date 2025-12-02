import type { TranslationMap } from '../types';

export const paymentsMessages = {
  en: {
    title: 'Secure card payment',
    intro: 'Enter an amount and complete your contribution in UniPAY\'s secure checkout.',
    amountLabel: 'Amount',
    amountPlaceholder: 'e.g. 25',
    currencyLabel: 'Currency',
    currencyPlaceholder: 'e.g. GEL',
    noteLabel: 'Optional note',
    notePlaceholder: 'Add a note for the team',
    submit: 'Continue to payment',
    status: {
      pending: 'Opening UniPAY checkout...',
      success: 'UniPAY checkout opened in your browser. Complete the payment there.',
      cancelled: 'Checkout closed before starting. You can try again.'
    },
    errors: {
      amountRequired: 'Enter a valid amount greater than zero.',
      sessionFailed: 'We couldn\'t process the payment. Try again in a moment.'
    }
  },
  es: {
    title: 'Pago seguro con tarjeta',
    intro: 'Ingresa un monto y completa tu contribución en el checkout seguro de UniPAY.',
    amountLabel: 'Importe',
    amountPlaceholder: 'p. ej. 25',
    currencyLabel: 'Moneda',
    currencyPlaceholder: 'p. ej. GEL',
    noteLabel: 'Nota opcional',
    notePlaceholder: 'Deja un mensaje para el equipo',
    submit: 'Continuar con el pago',
    status: {
      pending: 'Abriendo el checkout de UniPAY...',
      success: 'Checkout de UniPAY abierto en tu navegador. Completa el pago allí.',
      cancelled: 'Checkout cerrado antes de iniciar. Puedes intentarlo de nuevo.'
    },
    errors: {
      amountRequired: 'Introduce un importe válido mayor que cero.',
      sessionFailed: 'No pudimos procesar el pago. Inténtalo otra vez en unos segundos.'
    }
  },
  fr: {
    title: 'Paiement sécurisé par carte',
    intro: 'Indique un montant et finalise ta contribution dans le checkout sécurisé de UniPAY.',
    amountLabel: 'Montant',
    amountPlaceholder: 'ex. 25',
    currencyLabel: 'Devise',
    currencyPlaceholder: 'ex. GEL',
    noteLabel: 'Note optionnelle',
    notePlaceholder: 'Ajoute un message pour l\'équipe',
    submit: 'Continuer vers le paiement',
    status: {
      pending: 'Ouverture du checkout UniPAY...',
      success: 'Checkout UniPAY ouvert dans ton navigateur. Termine le paiement là-bas.',
      cancelled: 'Checkout fermé avant de démarrer. Tu peux réessayer.'
    },
    errors: {
      amountRequired: 'Entre un montant valide supérieur à zéro.',
      sessionFailed: 'Impossible de traiter le paiement. Réessaie dans un instant.'
    }
  }
} as const satisfies TranslationMap;