import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-win-checkers',
  locale: 'fr',
  title:
    "Comment Gagner aux Dames — Tactiques, Finales de Dames et Patterns d'Opposition",
  excerpt:
    "Les dames sont plus profondes qu'elles n'y paraissent. Apprenez les combinaisons de captures forcées, l'opposition des dames, les patterns de \"tir\" et la technique de finale.",
  publishedAt: '2026-09-13',
  author: 'Équipe Arcadeum',
  tags: ['Dames', 'Stratégie', 'Tactique', 'Jeu de Société'],
  readingTimeMinutes: 9,
  body: [
    {
      type: 'paragraph',
      text: "Les dames sont résolues au plus haut niveau — le jeu parfait des deux côtés mène toujours à nulle. Mais dans le jeu pratique entre humains, le jeu est extraordinairement riche. Les règles de capture obligatoire créent des opportunités combinatoires qui n'existent pas aux échecs.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Tactiques de capture forcée — le "tir"',
      id: 'shots',
    },
    {
      type: 'paragraph',
      text: "La règle de capture obligatoire est la source des tactiques les plus profondes aux dames. Un \"tir\" est une séquence de coups qui force l'adversaire à capturer dans une direction qui lui coûte plus de pièces qu'il n'en gagne. L'échange 2-pour-1 : sacrifiez une pièce pour capturer deux pièces de l'adversaire.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Finales de dames — opposition et le triangle',
      id: 'king-endgames',
    },
    {
      type: 'list',
      items: [
        "Trois dames contre deux : la technique gagnante est la triangulation — bougez vos dames en triangle pour éviter de donner l'opposition à l'adversaire.",
        "Deux dames contre une dans le double coin : c'est nulle avec le meilleur jeu du défenseur. La dame solitaire dans le double coin ne peut pas être chassée.",
        "Deux dames contre une en plein champ : victoire avec technique. Les dames aculent la solitaire vers le bord, puis la forcent à s'exposer.",
        'Ne maintenez jamais une dame dans un coin passivement. Une dame au centre contrôle plus de diagonales.',
      ],
    },
    {
      type: 'cta',
      href: '/games/checkers',
      text: 'Pratiquez les tactiques de dames — jouez sur Arcadeum',
      description:
        'Dames standard 8×8 avec règles complètes de capture obligatoire.',
    },
  ],
  faq: [
    {
      question: 'Les dames sont-elles un jeu résolu ?',
      answer:
        "Oui — le jeu parfait des deux côtés mène toujours à nulle. Mais en pratique, entre humains, le jeu est plein d'erreurs qui créent de vraies opportunités de victoire.",
    },
    {
      question: 'Combien de dames faut-il pour gagner ?',
      answer:
        'Trois dames contre deux est une victoire forcée avec la bonne technique. Deux contre une en position ouverte aussi. Deux contre une dans le double coin est nulle avec la meilleure défense.',
    },
  ],
};
