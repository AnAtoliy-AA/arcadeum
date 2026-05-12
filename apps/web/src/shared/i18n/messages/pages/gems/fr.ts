import type { GemsI18n } from './en';

export const gemsFr: GemsI18n = {
  meta: {
    title: 'Boutique de gemmes · Arcadeum',
    description: 'Achetez des gemmes pour booster votre expérience de jeu.',
  },
  store: {
    title: 'Boutique de gemmes',
    buy: 'Acheter',
    bonus: 'Bonus',
    buying: 'Achat…',
    empty: 'Aucun pack de gemmes disponible pour le moment.',
    loadError: 'Impossible de charger les packs de gemmes. Veuillez réessayer.',
  },
  pending: {
    title: 'Achats en attente',
    subtitle: 'Effectuez la vérification pour recevoir vos gemmes.',
    verify: 'Vérifier',
    verifying: 'Vérification…',
    empty: '',
  },
  convert: {
    title: 'Convertir des gemmes en pièces',
    rateLabel:
      '{gemsPerCoin} gemmes = 1 pièce (taux : {coinsPerGem} pièces par gemme)',
    currentGems: 'Vos gemmes : {gems}',
    gemsLabel: 'Gemmes',
    coinsLabel: 'Pièces',
    confirm: 'Convertir',
    success: 'Conversion réussie !',
    errorInvalidAmount: 'Saisissez un montant valide supérieur à zéro.',
    errorInsufficientFunds: "Vous n'avez pas assez de gemmes à convertir.",
    errorFailed: 'La conversion a échoué. Veuillez réessayer.',
  },
  errors: {
    insufficientGems: 'Pas assez de gemmes.',
    conversionFailed: 'La conversion a échoué. Veuillez réessayer.',
    purchaseFailed: "L'achat a échoué. Veuillez réessayer.",
    finalizeFailed: "Impossible de vérifier l'achat. Veuillez réessayer.",
  },
};
