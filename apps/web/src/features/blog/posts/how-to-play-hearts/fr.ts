import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-hearts',
  locale: 'fr',
  title:
    'Comment jouer aux Cœurs en ligne — règles, Dame de Pique, Tir à la Lune',
  excerpt:
    "Guide complet pour débutants : règles d'évitement de plis, stratégie de passage, tactiques avec la Dame de Pique et comment tirer à la Lune sans se faire prendre.",
  publishedAt: '2026-07-14',
  author: 'Équipe Arcadeum',
  tags: ['Hearts', 'Cœurs', 'Comment jouer', 'Stratégie', 'Jeu de cartes'],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: "Les Cœurs est un jeu classique d'évitement de plis pour quatre joueurs. L'objectif est simple : éviter de gagner des plis contenant des cœurs (1 point chacun) et la Dame de Pique (13 points). Le joueur avec le score le plus bas quand quelqu'un atteint 100 gagne. Sous l'objectif simple se cache un jeu tendu de lecture des adversaires, de vidage de couleurs et de décision de tirer à la Lune.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Distribution et préparation',
      id: 'setup',
    },
    {
      type: 'paragraph',
      text: "Un jeu de 52 cartes est distribué, 13 à chaque joueur. Il n'y a pas atout. Le 2 de Trèfle va au joueur qui commence le premier pli.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Passage de cartes',
      id: 'passing',
    },
    {
      type: 'paragraph',
      text: "Avant chaque main, chaque joueur passe trois cartes. La direction tourne : gauche, droite, en face, puis sans passe. Passe tes hautes cartes de la couleur que tu veux vider, mais attention — la Dame de Pique peut revenir. Une tactique courante est de passer des basses cartes d'une couleur où tu en as peu, créant un vide pour décharger les cœurs plus tard.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Comment fonctionnent les plis',
      id: 'tricks',
    },
    {
      type: 'paragraph',
      text: "Le joueur avec le 2 de Trèfle commence. On doit suivre la couleur si possible ; sinon, on joue n'importe quelle carte. La carte la plus haute de la couleur demandée gagne. Les cœurs ne peuvent pas être menés jusqu'à ce qu'ils soient \"brisés\" (joués quand un joueur ne pouvait pas suivre).",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Score',
      id: 'scoring',
    },
    {
      type: 'paragraph',
      text: 'Chaque cœur gagné = 1 point. La Dame de Pique = 13 points. Pas de points au premier pli. Quand les cœurs sont brisés, le gagnant du pli ramasse tous les cœurs.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Tir à la Lune',
      id: 'moon',
    },
    {
      type: 'paragraph',
      text: "Si tu recueilles TOUS les 13 cœurs ET la Dame de Pique (26 points), tu tires à la Lune — au lieu de gagner 26 points, chaque adversaire reçoit 26. C'est risqué. Si un seul cœur s'échappe, tu prends les 26. Cela nécessite un timing précis et la confiance que les adversaires ne peuvent pas bloquer.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Stratégie centrale',
      id: 'strategy',
    },
    {
      type: 'list',
      items: [
        "Créer des vides. Passe des cartes pour vider une couleur. C'est l'outil le plus puissant.",
        'Cartes basses. Garde des cartes basses dans chaque couleur. Quand tu ne peux pas suivre, joue des cœurs bas.',
        'Dame de Pique. Suis toujours si elle a été jouée. Sinon, évite de mener piques.',
        "Briser les cœurs tôt. Si tu as l'As ou le Roi de cœurs, joue tôt.",
        'Lire les adversaires. Observe les cartes passées et les couleurs vides.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Conseils tactiques',
      id: 'tactics',
    },
    {
      type: 'list',
      items: [
        'Esquive le premier pli. Si tu as le 2 de Trèfle, mène bas — le premier pli ne compte pas.',
        "Surveille les tireurs. Si un joueur prend l'As de Pique puis mène haut, il tire peut-être à la Lune.",
        'Maths de fin. Quand il reste peu de plis, compte les points.',
        "Ne retiens pas la Dame. Plus tu la gardes, plus quelqu'un mènera piques.",
      ],
    },
    {
      type: 'cta',
      href: '/games/hearts',
      text: 'Jouez aux Cœurs en ligne — gratuit, dans votre navigateur',
      description:
        'Ouvrez une salle de Cœurs, partagez le lien avec des amis ou jouez contre des bots IA.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'En résumé — quatre habitudes qui font gagner',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Crée un vide de couleur tôt pour décharger la Dame et les hauts cœurs.',
        'Suis la Dame de Pique et chaque cœur joué.',
        'Garde des cartes basses et ne mène pas les cœurs avant de tirer à la Lune.',
        'Bloque les tireurs en gagnant un seul cœur.',
      ],
    },
    {
      type: 'paragraph',
      text: "Aux Cœurs, l'information est tout. Chaque carte jouée raconte une histoire, et le joueur qui lit le plus d'histoires gagne le plus de parties.",
    },
  ],
  howTo: {
    totalTime: 'PT20M',
    steps: [
      {
        name: 'Crée un vide tôt',
        text: "Passe trois cartes d'une couleur à éliminer. Un vide permet de décharger cœurs ou la Dame.",
        url: '#passing',
      },
      {
        name: 'Suis la Dame de Pique',
        text: 'Note toujours si elle a été jouée. Sinon, évite de mener piques.',
        url: '#scoring',
      },
      {
        name: 'Garde des cartes basses',
        text: 'Aie des basses dans chaque couleur. Quand tu ne peux pas suivre, joue bas.',
        url: '#strategy',
      },
      {
        name: 'Bloque les tireurs',
        text: "Si quelqu'un recueille tout, gagne un cœur pour l'arrêter.",
        url: '#moon',
      },
    ],
  },
};
