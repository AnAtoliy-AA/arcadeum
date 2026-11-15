import type { Locale } from '@/shared/i18n';

export interface BlogLabels {
  relatedKicker: string;
  relatedTitle: string;
  relatedTitleForGame: string;
  minRead: string;
  readArticle: string;
  interactiveChallenge: string;
  correctMove: string;
  incorrectMove: string;
  incorrectHint: string;
  tryAgain: string;
  playFullGame: string;
}

export const BLOG_LABELS: Record<Locale, BlogLabels> = {
  en: {
    relatedKicker: 'Continue reading',
    relatedTitle: 'Related guides',
    relatedTitleForGame: 'Guides & strategy for {{game}}',
    minRead: 'min read',
    readArticle: 'Read article',
    interactiveChallenge: 'Interactive Challenge',
    correctMove: 'Correct Move!',
    incorrectMove: 'Not quite! That leaves an opening.',
    incorrectHint: 'Review the board threats and try again.',
    tryAgain: 'Try Again',
    playFullGame: 'Play Full Game Now',
  },
  es: {
    relatedKicker: 'Sigue leyendo',
    relatedTitle: 'Guías relacionadas',
    relatedTitleForGame: 'Guías y estrategia de {{game}}',
    minRead: 'min de lectura',
    readArticle: 'Leer artículo',
    interactiveChallenge: 'Desafío interactivo',
    correctMove: '¡Movimiento correcto!',
    incorrectMove: '¡No del todo! Queda una apertura.',
    incorrectHint: 'Revisa las amenazas del tablero e inténtalo de nuevo.',
    tryAgain: 'Reintentar',
    playFullGame: 'Jugar ahora',
  },
  fr: {
    relatedKicker: 'Continuer la lecture',
    relatedTitle: 'Guides associés',
    relatedTitleForGame: 'Guides et stratégie pour {{game}}',
    minRead: 'min de lecture',
    readArticle: "Lire l'article",
    interactiveChallenge: 'Défi interactif',
    correctMove: 'Coup correct !',
    incorrectMove: 'Pas tout à fait ! Cela laisse une ouverture.',
    incorrectHint: 'Analysez les menaces sur le plateau et réessayez.',
    tryAgain: 'Réessayer',
    playFullGame: 'Jouer maintenant',
  },
  ru: {
    relatedKicker: 'Читать дальше',
    relatedTitle: 'Связанные гайды',
    relatedTitleForGame: 'Гайды и стратегия по {{game}}',
    minRead: 'мин чтения',
    readArticle: 'Читать статью',
    interactiveChallenge: 'Интерактивная задача',
    correctMove: 'Верный ход!',
    incorrectMove: 'Не совсем! Это оставляет уязвимость.',
    incorrectHint: 'Изучите угрозы на поле и попробуйте снова.',
    tryAgain: 'Попробовать снова',
    playFullGame: 'Играть сейчас',
  },
  by: {
    relatedKicker: 'Чытаць далей',
    relatedTitle: 'Звязаныя гайды',
    relatedTitleForGame: 'Гайды і стратэгія па {{game}}',
    minRead: 'хв чытання',
    readArticle: 'Чытаць артыкул',
    interactiveChallenge: 'Інтэрактыўная задача',
    correctMove: 'Правільны ход!',
    incorrectMove: 'Не зусім! Гэта пакідае ўразлівасць.',
    incorrectHint: 'Вывучыце пагрозы на полі і паспрабуйце зноў.',
    tryAgain: 'Паспрабаваць зноў',
    playFullGame: 'Гуляць зараз',
  },
};
