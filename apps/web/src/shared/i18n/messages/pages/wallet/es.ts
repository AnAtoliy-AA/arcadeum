import type { WalletI18n } from './en';

export const walletEs: WalletI18n = {
  meta: {
    title: 'Cartera · Arcadeum',
    description: 'Consulta tus monedas, gemas e historial de transacciones.',
  },
  chip: {
    coinsLabel: 'Monedas',
    gemsLabel: 'Gemas',
  },
  page: {
    title: 'Tu cartera',
    summary: 'Las monedas se ganan jugando. Las gemas se compran.',
    filters: {
      all: 'Todas',
      coins: 'Monedas',
      gems: 'Gemas',
    },
    columns: {
      reason: 'Motivo',
      delta: 'Cambio',
      balanceAfter: 'Saldo después',
      createdAt: 'Cuándo',
    },
    next: 'Siguiente',
    empty: {
      title: 'Sin transacciones aún',
      description: 'Tu actividad en la cartera aparecerá aquí.',
    },
    error: {
      title: 'No se pudo cargar tu cartera',
      retry: 'Reintentar',
    },
  },
  reasons: {
    admin_grant: 'Otorgado por el administrador',
    admin_deduct: 'Deducido por el administrador',
  },
  errors: {
    insufficientFunds: 'Saldo insuficiente.',
    invalidCurrency: 'Moneda desconocida.',
    invalidAmount: 'La cantidad debe ser un entero positivo.',
    transactionFailed: 'Transacción fallida. Por favor, inténtalo de nuevo.',
  },
};
