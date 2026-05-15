export const gemsEn = {
  meta: {
    title: 'Gem Store · Arcadeum',
    description: 'Buy gems to power up your gameplay.',
  },
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
    empty: '',
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
  errors: {
    insufficientGems: 'Not enough gems.',
    conversionFailed: 'Conversion failed. Please try again.',
    purchaseFailed: 'Purchase failed. Please try again.',
    finalizeFailed: 'Could not verify purchase. Please try again.',
  },
};

export type GemsI18n = typeof gemsEn;
