import type { AdminGamesMessages } from './en';

export const adminGamesRu: AdminGamesMessages = {
  title: 'Видимость игр и вариантов',
  subtitle:
    'Ограничьте, кто может видеть и играть в каждую игру или встроенный вариант. Изменения вступают в силу в течение 30 секунд.',
  loading: 'Загрузка…',
  empty: 'Игры не зарегистрированы.',
  game: 'Игра',
  variants: 'Варианты',
  tier: 'Видимость',
  save: 'Сохранить',
  saving: 'Сохранение…',
  saveSuccess: 'Сохранено',
  saveFailed: 'Не удалось сохранить',
  tiers: {
    all: 'Все игроки',
    premium_plus: 'Premium+',
    vip_plus: 'VIP+',
    developers_plus: 'Разработчики и админы',
    none: 'Скрыто (скоро)',
  },
  comingSoonBadge: 'Скоро',
};
