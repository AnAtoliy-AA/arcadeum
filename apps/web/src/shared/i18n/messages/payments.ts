import type { Locale } from '../types';

const paymentsMessagesDefinition = {
  en: {
    title: 'Payment',
    subtitle: 'Secure and fast payments powered by PayPal',
    description:
      'Your contribution directly supports the development of new games, UI improvements, bug fixes, and performance optimizations. Thank you for making this possible!',
    secureInfo: 'Payments are 256-bit encrypted and secure.',
    amountLabel: 'Amount',
    amountPlaceholder: '0.00',
    amountAria: 'Payment amount',
    currencyLabel: 'Currency',
    currencyPlaceholder: 'GEL',
    currencyAria: 'Currency code',
    noteLabel: 'Note (optional)',
    notePlaceholder: 'Add a note...',
    noteAria: 'Payment note or description',
    submit: 'Create Payment',
    submitting: 'Processing...',
    status: {
      success: 'Payment session created successfully!',
    },
    errors: {
      invalidAmount: 'Please enter a valid amount',
      amountTooLarge: 'Amount is too large. Maximum is 1,000,000',
      invalidUrl: 'Invalid payment URL received',
      noUrl: 'No payment URL received',
      failed: 'Payment failed',
    },
    presets: {
      coffee: '☕️ Coffee',
      lunch: '🍕 Lunch',
      gift: '🎁 Gift',
      boost: '🚀 Boost',
    },
    successPage: {
      title: 'Payment Successful!',
      message:
        'Thank you for your generous support! Your contribution helps us keep the servers running, the coffee brewing, and the updates coming.',
      referenceLabel: 'Transaction Reference',
      returnHome: 'Return Home',
      supportAgain: 'Support Again',
    },
    cancelPage: {
      title: 'Payment Cancelled',
      message:
        "No worries! No charges were made to your account. You can always try again when you're ready—we'll be here.",
      tryAgain: 'Try Again',
      returnHome: 'Return Home',
    },
  },
  es: {
    title: 'Pago',
    subtitle: 'Pagos seguros y rápidos impulsados por PayPal',
    description:
      'Tu contribución apoya directamente el desarrollo de nuevos juegos, mejoras de interfaz, corrección de errores y optimizaciones de rendimiento. ¡Gracias por hacerlo posible!',
    secureInfo: 'Los pagos están cifrados con 256 bits y son seguros.',
    amountLabel: 'Cantidad',
    amountPlaceholder: '0.00',
    amountAria: 'Monto del pago',
    currencyLabel: 'Moneda',
    currencyPlaceholder: 'GEL',
    currencyAria: 'Código de moneda',
    noteLabel: 'Nota (opcional)',
    notePlaceholder: 'Agregar una nota...',
    noteAria: 'Nota o descripción del pago',
    submit: 'Crear Pago',
    submitting: 'Procesando...',
    status: {
      success: '¡Sesión de pago creada exitosamente!',
    },
    errors: {
      invalidAmount: 'Por favor ingresa una cantidad válida',
      amountTooLarge: 'La cantidad es demasiado grande. El máximo es 1,000,000',
      invalidUrl: 'URL de pago inválida recibida',
      noUrl: 'No se recibió URL de pago',
      failed: 'El pago falló',
    },
    presets: {
      coffee: '☕️ Café',
      lunch: '🍕 Almuerzo',
      gift: '🎁 Regalo',
      boost: '🚀 Impulso',
    },
    successPage: {
      title: '¡Pago Exitoso!',
      message:
        '¡Gracias por tu generoso apoyo! Tu contribución nos ayuda a mantener los servidores funcionando y las actualizaciones llegando.',
      referenceLabel: 'Referencia de Transacción',
      returnHome: 'Volver al Inicio',
      supportAgain: 'Apoyar de Nuevo',
    },
    cancelPage: {
      title: 'Pago Cancelado',
      message:
        '¡No te preocupes! No se realizaron cargos a tu cuenta. Siempre puedes intentarlo de nuevo cuando estés listo.',
      tryAgain: 'Intentar de Nuevo',
      returnHome: 'Volver al Inicio',
    },
  },
  fr: {
    title: 'Paiement',
    subtitle: 'Paiements sécurisés et rapides propulsés par PayPal',
    description:
      "Votre contribution soutient directement le développement de nouveaux jeux, les améliorations de l'interface, les corrections de bugs et les optimisations de performances. Merci de rendre cela possible !",
    secureInfo: 'Les paiements sont cryptés en 256 bits et sécurisés.',
    amountLabel: 'Montant',
    amountPlaceholder: '0.00',
    amountAria: 'Montant du paiement',
    currencyLabel: 'Devise',
    currencyPlaceholder: 'GEL',
    currencyAria: 'Code de devise',
    noteLabel: 'Note (optionnel)',
    notePlaceholder: 'Ajouter une note...',
    noteAria: 'Note ou description du paiement',
    submit: 'Créer un Paiement',
    submitting: 'Traitement...',
    status: {
      success: 'Session de paiement créée avec succès !',
    },
    errors: {
      invalidAmount: 'Veuillez saisir un montant valide',
      amountTooLarge: 'Le montant est trop élevé. Le maximum est de 1 000 000',
      invalidUrl: 'URL de paiement invalide reçue',
      noUrl: 'Aucune URL de paiement reçue',
      failed: 'Le paiement a échoué',
    },
    presets: {
      coffee: '☕️ Café',
      lunch: '🍕 Déjeuner',
      gift: '🎁 Cadeau',
      boost: '🚀 Boost',
    },
    successPage: {
      title: 'Paiement Réussi !',
      message:
        'Merci pour votre généreux soutien ! Votre contribution nous aide à maintenir les serveurs en marche et les mises à jour à venir.',
      referenceLabel: 'Référence de Transaction',
      returnHome: "Retour à l'Accueil",
      supportAgain: 'Soutenir à Nouveau',
    },
    cancelPage: {
      title: 'Paiement Annulé',
      message:
        "Pas de soucis ! Aucun frais n'a été débité de votre compte. Vous pouvez toujours réessayer quand vous serez prêt.",
      tryAgain: 'Réessayer',
      returnHome: "Retour à l'Accueil",
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const paymentsMessages = paymentsMessagesDefinition;

/** Derived type from the paymentsMessages object - English locale structure */
export type PaymentsMessages = (typeof paymentsMessagesDefinition)['en'];
