import { helpFaq } from '../help-faq/by';
import type { helpEn } from './en';

export const helpBy: typeof helpEn = {
  title: 'Цэнтр дапамогі Arcadeum',
  subtitle:
    'Кіраўніцтвы, правілы гульняў, кіраванне акаўнтам і вырашэнне праблем',
  description:
    'Вывучайце базу ведаў, шукайце адказы на частыя пытанні або звяртайцеся ў нашу службу падтрымкі.',
  searchPlaceholder: 'Пошук па артыкулах, тэмах і пытаннях…',
  noResults: 'Па запыце «{query}» нічога не знойдзена',
  allFaqs: 'Усе пытанні',
  status: {
    title: 'Статус платформы',
    operational: 'Усе сістэмы працуюць штатна',
    gateway: 'WebSocket-шлюз матчаў: 100% Анлайн',
    cloud: 'Воблака гульнявых сервераў: Нізкая затрымка',
  },
  categories: [
    {
      id: 'getting-started',
      title: 'З чаго пачаць',
      description:
        'Стварэнне пакояў, запрашэнне сяброў і гульня без рэгістрацыі.',
      icon: '🚀',
    },
    {
      id: 'games-rules',
      title: 'Гульні і правілы',
      description: 'Афіцыйныя правілы, варыянты, таймеры і падлік балаў.',
      icon: '♟️',
    },
    {
      id: 'account-security',
      title: 'Акаўнт і бяспека',
      description: 'Налады профілю, аднаўленне пароля і прыватнасць.',
      icon: '🔒',
    },
    {
      id: 'rewards-economy',
      title: 'Манеты і ўзнагароды',
      description: 'Штодзённыя серыі ўваходаў, узнагароды за квэсты і крама.',
      icon: '💎',
    },
    {
      id: 'tournaments-ranking',
      title: 'Турніры і рэйтынг',
      description: 'Турнірныя сеткі, разлік Elo і сезонныя табліцы лідараў.',
      icon: '🏆',
    },
    {
      id: 'technical-support',
      title: 'Тэхнічная падтрымка',
      description:
        'Ліквідацыя збояў сувязі, перападключэнне да гульняў і парады па затрымцы.',
      icon: '🛠️',
    },
  ],
  contactChannels: {
    title: 'Патрэбна дапамога напрамую?',
    subtitle:
      'Мадэратары супольнасці і каманда распрацоўшчыкаў заўсёды на сувязі.',
    discord: 'Discord супольнасць',
    tickets: 'Стварыць тыкет у падтрымку',
    email: 'support@arcadeum.net',
  },
  faq: helpFaq,
  comingSoon: 'Хутка з’явіцца больш інтэрактыўных гайдаў.',
};
