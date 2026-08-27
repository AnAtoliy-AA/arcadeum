import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-sudoku',
  locale: 'by',
  title: 'Як гуляць у Судоку онлайн — правілы, тэхнікі, стратэгія',
  excerpt:
    'Поўны гайд: правілы, сканіраванне, анатацыі і лагічныя крокі для рашэння без угадвання.',
  publishedAt: '2026-06-12',
  author: 'Каманда Arcadeum',
  tags: ['Sudoku', 'Пазл', 'Як гуляць', 'Логіка', 'Стратэгія'],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: 'Судоку — самы папулярны пазл з лічбамі. Рашотка 9x9, дзевяць боксаў 3x3, некаторыя клеткі запоўнены. Запоўніце, каб кожны радок, слупок і бокс мелі 1-9 адзін раз.',
    },
    { type: 'heading', level: 2, text: 'Правілы', id: 'rules' },
    {
      type: 'paragraph',
      text: 'Кожны радок, слупок і бокс 3x3 утрымлівае 1-9 адзін раз.',
    },
    { type: 'heading', level: 2, text: 'Сканіраванне', id: 'scanning' },
    {
      type: 'paragraph',
      text: 'Перакрыжаванне — аснова. Для кожнага ліку правяройце радкі, слупкі і боксы.',
    },
    { type: 'heading', level: 2, text: 'Анатацыі', id: 'pencil-marks' },
    { type: 'paragraph', text: 'Пішыце кандыдатаў у кожную пустую клетку.' },
    { type: 'heading', level: 2, text: 'Тэхнікі', id: 'intermediate' },
    {
      type: 'list',
      items: [
        'Голыя пары.',
        'Голыя тройкі.',
        'Схаваныя пары.',
        'Пары з пунктаў.',
      ],
    },
    { type: 'heading', level: 2, text: 'Звычкі', id: 'strategy' },
    {
      type: 'list',
      items: [
        'Ніколі не ўгадвайце.',
        'Працуйце сістэматычна.',
        'Абнаўляйце анатацыі.',
        'Пачынайце з самых абмежаваных.',
      ],
    },
    {
      type: 'cta',
      href: '/games/sudoku',
      text: 'Гуляйце ў Судоку онлайн — бясплатна',
      description: 'Розныя ўзроўні складанасці.',
    },
    { type: 'heading', level: 2, text: 'Каротка', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Перакрыжаванне.',
        'Анатацыі + сінглы.',
        'Не ўгадвайце.',
        'Сістэматычна.',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT20M',
    steps: [
      {
        name: 'Перакрыжаванне',
        text: 'Правяройце кожны лік.',
        url: '#scanning',
      },
      {
        name: 'Анатацыі',
        text: 'Кандыдаты ў кожнай клетцы.',
        url: '#pencil-marks',
      },
      {
        name: 'Сінглы',
        text: 'Адзін кандыдат = рашэнне.',
        url: '#pencil-marks',
      },
      { name: 'Не ўгадвайце', text: 'Шукайце пары.', url: '#strategy' },
    ],
  },
};
