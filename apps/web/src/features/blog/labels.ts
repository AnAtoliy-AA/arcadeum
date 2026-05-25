import type { Locale } from '@/shared/i18n';

/**
 * Locale-keyed chrome labels for blog/related-content surfaces. Kept
 * out of the global `common`/`seo` namespaces because they're scoped
 * to this feature and the message bag is small enough that a flat
 * mapping is clearer than the aggregator-per-locale pattern.
 */
export const BLOG_LABELS: Record<
  Locale,
  {
    relatedKicker: string;
    relatedTitle: string;
    relatedTitleForGame: string;
    minRead: string;
    readArticle: string;
  }
> = {
  en: {
    relatedKicker: 'Continue reading',
    relatedTitle: 'Related guides',
    relatedTitleForGame: 'Guides & strategy for {{game}}',
    minRead: 'min read',
    readArticle: 'Read article',
  },
  es: {
    relatedKicker: 'Sigue leyendo',
    relatedTitle: 'Guías relacionadas',
    relatedTitleForGame: 'Guías y estrategia de {{game}}',
    minRead: 'min de lectura',
    readArticle: 'Leer artículo',
  },
  fr: {
    relatedKicker: 'Continuer la lecture',
    relatedTitle: 'Guides associés',
    relatedTitleForGame: 'Guides et stratégie pour {{game}}',
    minRead: 'min de lecture',
    readArticle: "Lire l'article",
  },
  ru: {
    relatedKicker: 'Читать дальше',
    relatedTitle: 'Связанные гайды',
    relatedTitleForGame: 'Гайды и стратегия по {{game}}',
    minRead: 'мин чтения',
    readArticle: 'Читать статью',
  },
  by: {
    relatedKicker: 'Чытаць далей',
    relatedTitle: 'Звязаныя гайды',
    relatedTitleForGame: 'Гайды і стратэгія па {{game}}',
    minRead: 'хв чытання',
    readArticle: 'Чытаць артыкул',
  },
};
