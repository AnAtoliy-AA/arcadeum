import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'backgammon-pip-count-guide',
  locale: 'fr',
  title:
    'Comptage de Pions au Backgammon et Décisions du Cube — Guide Pratique',
  excerpt:
    "Maîtrisez le comptage de pions pour gagner plus de décisions de course et doubler avec confiance. Inclut des méthodes de comptage étape par étape, la règle d'acceptation du cube à 25% et la réflexion sur l'équité de match.",
  publishedAt: '2026-09-14',
  author: 'Équipe Arcadeum',
  tags: ['Backgammon', 'Stratégie', 'Cube de Doublement', 'Avancé', 'Dés'],
  readingTimeMinutes: 9,
  body: [
    {
      type: 'paragraph',
      text: "La compétence unique qui sépare les joueurs de backgammon intermédiaires des avancés n'est pas la vision du plateau — c'est le comptage de pions. Un compte de pions vous dit exactement combien de pions (points de dés) chaque joueur a besoin pour retirer toutes ses pièces.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Comment compter les pions — étape par étape',
      id: 'counting-method',
    },
    {
      type: 'paragraph',
      text: 'La méthode la plus simple : multipliez le nombre de pièces sur chaque point par le numéro du point, puis additionnez tout. Exemple : 3 pièces sur le point 6, 2 sur le 5, 4 sur le 4. Compte : (3×6)+(2×5)+(4×4) = 18+10+16 = 44. Répétez pour tout le plateau. La somme est votre compte de pions. Le joueur avec le nombre le plus bas mène la course.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Théorie du cube — quand doubler et quand accepter',
      id: 'cube-theory',
    },
    {
      type: 'list',
      items: [
        "Point d'offre (doubler) : approximativement quand votre probabilité de gagner dépasse 70-75%. En course pure, si votre avantage est de 8-10% ou plus sur votre compte — doublez.",
        "Point d'acceptation : approximativement avec 25% ou plus de chances de gagner. Mathématique : si vous refusez, perdez 1 point. Si vous acceptez avec 25% : espérance = 0.25×2 = 0.5 vs. 1 point perdu en refusant.",
        'Règle des 8% : en positions de course pure, si votre compte est meilleur de 8-10% — vous avez une offre initiale valide.',
      ],
    },
    {
      type: 'cta',
      href: '/games/backgammon',
      text: 'Pratiquez vos décisions de cube — jouez au Backgammon sur Arcadeum',
      description: 'Backgammon avec le cube de doublement complet.',
    },
  ],
  faq: [
    {
      question:
        'Le comptage de pions est-il vraiment nécessaire pour le jeu casual ?',
      answer:
        "Au niveau casual, l'intuition fonctionne souvent. Mais dès que vous jouez contre des gens qui comptent, vous perdrez systématiquement les décisions du cube de doublement. Même une estimation approximative — qui mène et de combien — change significativement votre jeu.",
    },
    {
      question: "Quel est l'avantage minimum de pions pour doubler ?",
      answer:
        'En course pure, environ 8-10% de votre compte. Dans les positions avec contact, le compte seul ne suffit pas — vous devez aussi évaluer les facteurs positionnels comme les ancres et les primes.',
    },
  ],
};
