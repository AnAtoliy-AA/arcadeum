import type { GemsI18n } from './en';

export const gemsEs: GemsI18n = {
  meta: {
    title: 'Tienda de gemas · Arcadeum',
    description: 'Compra gemas para potenciar tu experiencia de juego.',
  },
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
    empty: '',
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
  errors: {
    insufficientGems: 'No tienes suficientes gemas.',
    conversionFailed: 'La conversión falló. Por favor, inténtalo de nuevo.',
    purchaseFailed: 'La compra falló. Por favor, inténtalo de nuevo.',
    finalizeFailed:
      'No se pudo verificar la compra. Por favor, inténtalo de nuevo.',
  },
};
