// Mobile supports en / es / fr only (ru and by are web-only locales).
// Keys mirror the web gems namespace (apps/web/src/shared/i18n/messages/pages/gems/).
import type { TranslationMap } from '../types';

export const gemsMessages = {
  en: {
    store: {
      title: 'Gem Store',
      buy: 'Buy',
      bonus: 'Bonus',
      buying: 'Buying…',
      empty: 'No gem packages available right now.',
      loadError: 'Could not load gem packages. Please try again.',
    },
    pending: {
      title: 'Pending purchases',
      subtitle: 'Complete verification to receive your gems.',
      verify: 'Verify',
      verifying: 'Verifying…',
    },
    convert: {
      title: 'Convert Gems to Coins',
      rateLabel:
        '{gemsPerCoin} gems = 1 coin (rate: {coinsPerGem} coins per gem)',
      currentGems: 'Your gems: {gems}',
      gemsLabel: 'Gems',
      coinsLabel: 'Coins',
      confirm: 'Convert',
      success: 'Conversion successful!',
      errorInvalidAmount: 'Enter a valid amount greater than zero.',
      errorInsufficientFunds: 'Not enough gems to convert.',
      errorFailed: 'Conversion failed. Please try again.',
    },
  },
  es: {
    store: {
      title: 'Tienda de gemas',
      buy: 'Comprar',
      bonus: 'Bono',
      buying: 'Comprando…',
      empty: 'No hay paquetes de gemas disponibles ahora mismo.',
      loadError:
        'No se pudieron cargar los paquetes de gemas. Inténtalo de nuevo.',
    },
    pending: {
      title: 'Compras pendientes',
      subtitle: 'Completa la verificación para recibir tus gemas.',
      verify: 'Verificar',
      verifying: 'Verificando…',
    },
    convert: {
      title: 'Convertir gemas a monedas',
      rateLabel:
        '{gemsPerCoin} gemas = 1 moneda (tasa: {coinsPerGem} monedas por gema)',
      currentGems: 'Tus gemas: {gems}',
      gemsLabel: 'Gemas',
      coinsLabel: 'Monedas',
      confirm: 'Convertir',
      success: '¡Conversión exitosa!',
      errorInvalidAmount: 'Ingresa una cantidad válida mayor a cero.',
      errorInsufficientFunds: 'No tienes suficientes gemas para convertir.',
      errorFailed: 'La conversión falló. Por favor, inténtalo de nuevo.',
    },
  },
  fr: {
    store: {
      title: 'Boutique de gemmes',
      buy: 'Acheter',
      bonus: 'Bonus',
      buying: 'Achat…',
      empty: 'Aucun pack de gemmes disponible pour le moment.',
      loadError:
        'Impossible de charger les packs de gemmes. Veuillez réessayer.',
    },
    pending: {
      title: 'Achats en attente',
      subtitle: 'Effectuez la vérification pour recevoir vos gemmes.',
      verify: 'Vérifier',
      verifying: 'Vérification…',
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
  },
} as const satisfies Pick<TranslationMap, 'en' | 'es' | 'fr'>;
