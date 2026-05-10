import type { GemsI18n } from './en';

export const gemsBy: GemsI18n = {
  meta: {
    title: 'Крама каштоўных камянёў · Arcadeum',
    description: 'Купіце каштоўныя камяні для паляпшэння гульнёвага працэсу.',
  },
  store: {
    title: 'Крама каштоўных камянёў',
    buy: 'Купіць',
    bonus: 'Бонус',
    buying: 'Куплю…',
    empty: 'Пакеты каштоўных камянёў часова недаступны.',
    loadError: 'Не атрымалася загрузіць пакеты. Паспрабуйце яшчэ раз.',
  },
  pending: {
    title: 'Чакаючыя пакупкі',
    subtitle: 'Завяршыце праверку для атрымання каштоўных камянёў.',
    verify: 'Правесці',
    verifying: 'Правяраю…',
    empty: '',
  },
  convert: {
    title: 'Канвертаваць каштоўныя камяні ў манеты',
    rateLabel:
      '{gemsPerCoin} камянёў = 1 манета (курс: {coinsPerGem} манеты за камень)',
    currentGems: 'Вашы камяні: {gems}',
    gemsLabel: 'Камяні',
    coinsLabel: 'Манеты',
    confirm: 'Канвертаваць',
    success: 'Канвертацыя выкананая!',
    errorInvalidAmount: 'Увядзіце карэктную колькасць большую за нуль.',
    errorInsufficientFunds: 'Недастаткова каштоўных камянёў для канвертацыі.',
    errorFailed: 'Памылка канвертацыі. Паспрабуйце яшчэ раз.',
  },
  errors: {
    insufficientGems: 'Недастаткова каштоўных камянёў.',
    conversionFailed: 'Памылка канвертацыі. Паспрабуйце яшчэ раз.',
    purchaseFailed: 'Памылка пакупкі. Паспрабуйце яшчэ раз.',
    finalizeFailed: 'Не атрымалася пацвердзіць пакупку. Паспрабуйце яшчэ раз.',
  },
};
