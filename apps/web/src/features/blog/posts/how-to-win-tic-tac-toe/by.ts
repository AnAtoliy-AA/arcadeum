import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-win-tic-tac-toe',
  locale: 'by',
  title:
    'Як перамагчы ў Вясёлкі-Крыжыкі — стратэгія, вілы, першы і другі гулец',
  excerpt:
    'Поўны гайд: перавага першага гульца, абарона, тэхніка вілаў і звычкі пераможцаў.',
  publishedAt: '2026-06-30',
  author: 'Каманда Arcadeum',
  tags: [
    'Tic Tac Toe',
    'Як гуляць',
    'Стратэгія',
    'Настольная гульня',
    'Логіка',
  ],
  readingTimeMinutes: 5,
  body: [
    {
      type: 'paragraph',
      text: 'Вясёлкі-Крыжыкі — вырашана гульня. Пры ідэальнай гульні — нічыя. Але сапернікі памыляюцца. Той, хто ведае стратэгію, карае памылкі.',
    },
    { type: 'heading', level: 2, text: 'Правілы', id: 'rules' },
    {
      type: 'paragraph',
      text: 'Два гульцы ставяць X або O на рашотцы 3x3. X пачынае. Тры ў шэраг = перамога. Рашотка поўная без шэрагу = нічыя.',
    },
    { type: 'heading', level: 2, text: 'Першы гулец (X)', id: 'first-player' },
    {
      type: 'paragraph',
      text: 'Пачынайце з цэнтра — самая моцная. Калі сапернік бярэ бок — X можа прымусіць. Калі кут — кут насупрацьці. Ніколі не бок — у другога перавага.',
    },
    { type: 'heading', level: 2, text: 'Другі гулец (O)', id: 'second-player' },
    {
      type: 'paragraph',
      text: 'Калі X цэнтр — O кут. Калі X кут — O цэнтр. Цэнтр самы каштоўны, затым куты, потым бакі.',
    },
    { type: 'heading', level: 2, text: 'Вілы', id: 'forks' },
    {
      type: 'paragraph',
      text: 'Вілы ствараюць дзве пагрозы. Сапернік можа блакіраваць адну. Перад кожным ходам шукайце вілы.',
    },
    { type: 'heading', level: 2, text: 'Прыярытэты', id: 'priority' },
    {
      type: 'list',
      items: [
        'Перамога.',
        'Блакіроўка.',
        'Стварэнне вілаў.',
        'Блакіроўка вілаў.',
        'Цэнтр ці куты.',
      ],
    },
    {
      type: 'cta',
      href: '/games/tic-tac-toe',
      text: 'Гуляйце ў Вясёлкі-Крыжыкі — бясплатна',
      description: 'Сябры ці AI.',
    },
    { type: 'heading', level: 2, text: 'Каротка', id: 'tldr' },
    {
      type: 'list',
      items: ['Цэнтр X.', 'Вілы.', 'Блакіруйце.', 'Ніколі бок.'],
    },
  ],
  howTo: {
    totalTime: 'PT5M',
    steps: [
      { name: 'Цэнтр', text: 'X пачынае з цэнтра.', url: '#first-player' },
      { name: 'Куты', text: 'O кут супраць цэнтра.', url: '#second-player' },
      { name: 'Вілы', text: 'Дзве пагрозы.', url: '#forks' },
      { name: 'Блакіроўка', text: 'Правярайце вілы.', url: '#forks' },
    ],
  },
};
