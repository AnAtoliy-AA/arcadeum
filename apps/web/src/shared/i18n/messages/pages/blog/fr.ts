import type { blogEn } from './en';

export const blogFr: typeof blogEn = {
  title: 'Blog de Jeux Arcadeum',
  subtitle:
    'Guides de jeu, analyses de stratégies, notes de mise à jour et récits de la communauté',
  description:
    'Analyses approfondies des mécaniques de jeux de plateau, résumés de tournois, notes de patch et astuces de pros.',
  searchPlaceholder: 'Rechercher des articles et des guides…',
  allCategories: 'Tous les sujets',
  categories: {
    all: 'Tous',
    guides: 'Guides Stratégiques',
    updates: 'Mises à jour',
    community: 'Communauté',
    tournaments: 'Tournois',
  },
  featuredBadge: 'Article à la Une',
  minRead: '{min} min de lecture',
  newsletter: {
    title: 'Abonnez-vous aux Notes de Patch et Guides',
    subtitle:
      'Soyez alerté lors des sorties de jeux, tournois et équilibrages.',
    placeholder: 'Entrez votre adresse e-mail',
    button: 'S’abonner',
    success: 'Merci pour votre inscription !',
  },
  cta: {
    title: 'Une stratégie ou une histoire à partager ?',
    description:
      'Rejoignez notre Discord et proposez vos guides pour être mis en avant sur le blog.',
    button: 'Proposer un Article',
  },
};
