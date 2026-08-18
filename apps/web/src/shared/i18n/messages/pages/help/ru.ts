import { helpFaq } from '../help-faq/ru';
import type { helpEn } from './en';

export const helpRu: typeof helpEn = {
  title: 'Центр помощи Arcadeum',
  subtitle: 'Руководства, правила игр, управление аккаунтом и решение проблем',
  description:
    'Изучайте базу знаний, ищите ответы на частые вопросы или связывайтесь с нашей службой поддержки.',
  searchPlaceholder: 'Поиск по статьям, темам и вопросам…',
  noResults: 'По запросу «{query}» ничего не найдено',
  allFaqs: 'Все вопросы',
  status: {
    title: 'Статус платформы',
    operational: 'Все системы работают штатно',
    gateway: 'WebSocket-шлюз матчей: 100% Онлайн',
    cloud: 'Облако игровых серверов: Низкая задержка',
  },
  categories: [
    {
      id: 'getting-started',
      title: 'С чего начать',
      description:
        'Создание комнат, приглашение друзей и игра без регистрации.',
      icon: '🚀',
    },
    {
      id: 'games-rules',
      title: 'Игры и правила',
      description: 'Официальные правила, варианты, таймеры и подсчет очков.',
      icon: '♟️',
    },
    {
      id: 'account-security',
      title: 'Аккаунт и безопасность',
      description: 'Настройки профиля, восстановление пароля и приватность.',
      icon: '🔒',
    },
    {
      id: 'rewards-economy',
      title: 'Монеты и награды',
      description:
        'Ежедневные серии входов, награды за квесты и покупки в магазине.',
      icon: '💎',
    },
    {
      id: 'tournaments-ranking',
      title: 'Турниры и рейтинг',
      description: 'Турнирные сетки, расчет Elo и сезонные таблицы лидеров.',
      icon: '🏆',
    },
    {
      id: 'technical-support',
      title: 'Техническая поддержка',
      description:
        'Устранение сбоев связи, переподключение к играм и оптимизация задержки.',
      icon: '🛠️',
    },
  ],
  contactChannels: {
    title: 'Нужна помощь напрямую?',
    subtitle: 'Модераторы сообщества и команда разработчиков всегда на связи.',
    discord: 'Discord сообщество',
    tickets: 'Создать тикет в поддержку',
    email: 'support@arcadeum.net',
  },
  faq: helpFaq,
  comingSoon: 'Скоро появится больше интерактивных гайдов.',
};
