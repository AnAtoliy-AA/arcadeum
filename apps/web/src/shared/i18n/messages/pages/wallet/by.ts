import type { WalletI18n } from './en';

export const walletBy: WalletI18n = {
  meta: {
    title: 'Кашалёк · Arcadeum',
    description: 'Прагледзьце манеты, каштоўныя камяні і гісторыю транзакцый.',
  },
  chip: {
    coinsLabel: 'Манеты',
    gemsLabel: 'Каштоўныя камяні',
  },
  page: {
    title: 'Ваш кашалёк',
    summary: 'Манеты зарабляюцца ў гульні. Каштоўныя камяні купляюцца.',
    filters: {
      all: 'Усе',
      coins: 'Манеты',
      gems: 'Каштоўныя камяні',
    },
    columns: {
      reason: 'Прычына',
      delta: 'Змяненне',
      balanceAfter: 'Баланс пасля',
      createdAt: 'Калі',
    },
    next: 'Далей',
    empty: {
      title: 'Транзакцый пакуль няма',
      description: 'Ваша актыўнасць у кашальку адлюструецца тут.',
    },
    error: {
      title: 'Не атрымалася загрузіць кашалёк',
      retry: 'Паўтарыць',
    },
  },
  reasons: {
    admin_grant: 'Выдадзена адміністратарам',
    admin_deduct: 'Спісана адміністратарам',
    game_win: 'Перамога ў гульні',
    tournament_entry: 'Узнос за турнір',
    tournament_refund: 'Вяртанне за турнір',
    tournament_prize: 'Прыз турніру',
    gem_purchase: 'Куплены каштоўныя камяні',
    gem_to_coin_conversion_debit: 'Канвертацыя камянёў у манеты',
    gem_to_coin_conversion_credit: 'Манеты з канвертацыі',
    referral_bonus: 'Бонус за запрашэнне',
    referral_tier_bonus: 'Бонус за ўзровень запрашэнняў',
  },
  errors: {
    insufficientFunds: 'Недастаткова сродкаў.',
    invalidCurrency: 'Невядомая валюта.',
    invalidAmount: 'Сума павінна быць дадатным цэлым лікам.',
    transactionFailed: 'Транзакцыя не выканана. Паспрабуйце яшчэ раз.',
  },
};
