import type { Locale } from '@/shared/i18n';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_BY_LOCALE: Record<Locale, FaqItem[]> = {
  en: [
    {
      question: 'What is Arcadeum?',
      answer:
        'Arcadeum is a free online gaming platform offering instant-play multiplayer board games, card games, puzzles, and arcade mini-games in your web browser with no downloads or mandatory registration.',
    },
    {
      question: 'What types of games can I play on Arcadeum?',
      answer:
        'You can play classic board games (Chess, Checkers, Go, Backgammon, Pachisi), card games (Cascade, Critical, Hearts, Spades, Solitaire), and fast arcade mini-games (2048, Minesweeper, Sudoku, Glimworm, Sea Battle).',
    },
    {
      question: 'Can I play with friends or against AI bots?',
      answer:
        'Yes, you can practice solo against intelligent AI bots with adjustable difficulty levels, or create private multiplayer rooms and share the link to play with friends anywhere.',
    },
    {
      question: 'Do I need to install or download anything to play?',
      answer:
        'No installation or downloads are required. All games run directly in any modern desktop or mobile browser.',
    },
    {
      question: 'Is Arcadeum free?',
      answer:
        'Yes, all games and multiplayer rooms on Arcadeum are 100% free to play.',
    },
  ],
  es: [
    {
      question: '¿Qué es Arcadeum?',
      answer:
        'Arcadeum es una plataforma de juegos online gratuita que ofrece juegos de mesa multijugador, juegos de cartas, rompecabezas y minijuegos arcade directamente en tu navegador sin descargas.',
    },
    {
      question: '¿Qué tipos de juegos puedo jugar en Arcadeum?',
      answer:
        'Puedes jugar a juegos de mesa clásicos (Ajedrez, Damas, Go, Backgammon, Pachisi), juegos de cartas (Cascade, Critical, Corazones, Picas, Solitario) y minijuegos arcade (2048, Buscaminas, Sudoku, Glimworm, Batalla Naval).',
    },
    {
      question: '¿Puedo jugar con amigos o contra bots de IA?',
      answer:
        'Sí, puedes jugar en solitario contra bots inteligentes con dificultad ajustable o crear salas privadas y compartir el enlace con amigos.',
    },
    {
      question: '¿Es gratis jugar en Arcadeum?',
      answer:
        'Sí, todos los juegos y salas multijugador en Arcadeum son completamente gratuitos.',
    },
  ],
  fr: [
    {
      question: "Qu'est-ce qu'Arcadeum ?",
      answer:
        "Arcadeum est une plateforme de jeu en ligne gratuite proposant des jeux de société multijoueurs, jeux de cartes, casse-têtes et mini-jeux d'arcade dans votre navigateur sans téléchargement.",
    },
    {
      question: 'Quels types de jeux sont disponibles sur Arcadeum ?',
      answer:
        'Vous pouvez jouer aux échecs, dames, go, backgammon, pachisi, cascade, critical, solitaire, coeurs, 2048, démineur, sudoku, glimworm et bataille navale.',
    },
    {
      question: "Peut-on jouer avec des amis ou contre l'IA ?",
      answer:
        'Oui, vous pouvez vous entraîner contre des bots IA intelligents ou créer des salons privés pour jouer avec vos amis via un simple lien.',
    },
    {
      question: 'Arcadeum est-il gratuit ?',
      answer:
        'Oui, tous les jeux et salons multijoueurs sur Arcadeum sont 100% gratuits.',
    },
  ],
  ru: [
    {
      question: 'Что такое Arcadeum?',
      answer:
        'Arcadeum — это бесплатная игровая онлайн-платформа с мгновенным доступом к настольным, карточным играм, головоломкам и аркадным мини-играм прямо в браузере без скачивания и обязательной регистрации.',
    },
    {
      question: 'В какие игры можно играть на Arcadeum?',
      answer:
        'Вам доступны классические настольные игры (Шахматы, Шашки, Го, Нарды, Пачиси), карточные игры (Cascade, Critical, Червы, Пики, Пасьянс) и аркадные мини-игры (2048, Сапер, Судоку, Glimworm, Морской Бой).',
    },
    {
      question: 'Можно ли играть с друзьями или против ИИ?',
      answer:
        'Да, вы можете играть в одиночку против умных ботов с настраиваемой сложностью или создавать приватные игровые комнаты и отправлять ссылку друзьям.',
    },
    {
      question: 'Нужно ли скачивать или устанавливать приложение?',
      answer:
        'Нет, ничего скачивать не нужно. Все игры работают в любом современном браузере на компьютере или телефоне.',
    },
    {
      question: 'Arcadeum бесплатный?',
      answer:
        'Да, все игры и многопользовательские комнаты на Arcadeum полностью бесплатны.',
    },
  ],
  by: [
    {
      question: 'Што такое Arcadeum?',
      answer:
        'Arcadeum — гэта бясплатная гульнявая анлайн-платформа з імгненным доступам да настольных, картачных гульняў, галаваломак і аркадных міні-гульняў наўпрост у браўзеры без спампоўкі.',
    },
    {
      question: 'У якія гульні можна гуляць на Arcadeum?',
      answer:
        'Вам даступныя класічныя настольныя гульні (Шахматы, Шашкі, Го, Нарды, Пачысі), картачныя гульні (Cascade, Critical, Чэрвы, Пікі, Пасьянс) і міні-гульні (2048, Сапёр, Судоку, Glimworm, Марскі Бой).',
    },
    {
      question: 'Ці можна гуляць з сябрамі або супраць ІІ?',
      answer:
        'Так, вы можаце гуляць у адзіночку супраць разумных ботаў або ствараць прыватныя пакоі для сяброў.',
    },
    {
      question: 'Ці бясплатны Arcadeum?',
      answer:
        'Так, усе гульні і гульнявыя пакоі на Arcadeum цалкам бясплатныя.',
    },
  ],
};

/**
 * FAQPage schema is restricted to government and healthcare authority
 * sites only (Google, August 2023). Returning an empty array avoids the
 * "unrecognized schema" warning in Search Console while the FAQ content
 * remains available as visible HTML on the page for regular indexing.
 */
export function buildHomeFaqJsonLd(_locale: Locale): Record<string, unknown>[] {
  return [];
}
