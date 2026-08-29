import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'sea-battle-best-strategies-and-placements',
  locale: 'fr',
  title:
    'Meilleures stratégies et placements pour la Bataille Navale (Touché-Coulé)',
  excerpt:
    'Guide complet pour gagner à la Bataille Navale : schémas de placement de flotte 10×10, recherche en damier (Parity Search) et astuces pour jouer en ligne.',
  publishedAt: '2026-08-29',
  author: 'Équipe Arcadeum',
  tags: [
    'Bataille Navale',
    'Touché-Coulé',
    'Stratégie',
    'Placement des navires',
    'Jeux de plateau',
    'Battleship',
  ],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: 'La Bataille Navale (Touché-Coulé) est bien plus qu’un jeu de hasard. C’est un affrontement logique fondé sur les probabilités et la déduction spatiale. Plus de 80 % de la victoire se joue dès la disposition initiale de votre flotte. Ce guide détaille les meilleures configurations de navires et tactiques de tir pour dominer vos adversaires en ligne.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Grille 10×10 et composition de la flotte',
      id: 'grille-et-flotte',
    },
    {
      type: 'paragraph',
      text: 'La partie se déroule sur une grille carrée de 10×10 cases (100 cases au total). Les navires ne peuvent pas se toucher, ni par les côtés ni par les coins. Une zone tampon d’une case se crée donc obligatoirement autour de chaque navire coulé.',
    },
    {
      type: 'list',
      items: [
        '1 Cuirassé (4 cases)',
        '2 Croiseurs (3 cases chacun)',
        '3 Torpilleurs / Destroyers (2 cases chacun)',
        '4 Sous-marins (1 case chacun)',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Les 4 meilleures stratégies de placement',
      id: 'strategies-placement',
    },
    {
      type: 'list',
      items: [
        '1. La stratégie côtière (périmètre) : placer vos grands navires le long des bords de la grille évacue la moitié de leurs zones tampons hors du plateau, libérant l’espace central.',
        '2. L’échelonnement en diagonale : disposer les bateaux le long d’axes diagonaux évite qu’un balayage en ligne droite ne détecte plusieurs cibles à la suite.',
        '3. La répartition en 4 quadrants : diviser mentalement la grille en 4 zones de 5×5 et y répartir équitablement les unités pour éviter les défaites en chaîne.',
        '4. La tactique furtive des sous-marins : regrouper les gros navires d’un côté et disséminer les petits sous-marins d’une case au centre pour rendre la phase finale presque impossible à deviner.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Tactiques de tir : recherche en damier et traque ciblée',
      id: 'tactiques-tir',
    },
    {
      type: 'list',
      items: [
        'Recherche en damier : tirer uniquement sur les cases d’une couleur alternée permet de toucher à coup sûr tout navire de 2 cases ou plus en divisant le nombre de tirs par deux.',
        'Phase de traque : après un impact « touché », sondez les 4 directions cardinales, puis suivez l’axe confirmé jusqu’au « coulé ».',
        'Exclusion des zones mortes : ne tirez jamais sur les 8 cases entourant un navire entièrement détruit.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Jouer en ligne gratuitement avec un ami ou l’IA',
      id: 'jouer-en-ligne',
    },
    {
      type: 'paragraph',
      text: 'Sur Arcadeum, jouez instantanément à la Bataille Navale dans votre navigateur. Créez une salle privée en un clic, invitez un ami via un simple lien ou affrontez une IA tactique.',
    },
    {
      type: 'cta',
      href: '/games/sea-battle',
      text: 'Jouer à la Bataille Navale en Ligne — Créer une salle',
      description:
        'Testez vos tactiques de placement dès maintenant : gratuit, sans inscription, à 2 ou 4 joueurs !',
    },
  ],
  faq: [
    {
      question: 'Quel est le meilleur placement à la Bataille Navale ?',
      answer:
        'La disposition côtière pour les grands navires (3 et 4 cases) combinée à une dispersion aléatoire des sous-marins (1 case) au centre offre le meilleur taux de victoire.',
    },
    {
      question: 'Comment fonctionne la technique du damier ?',
      answer:
        'En tirant une case sur deux (comme sur un damier), vous êtes certain de repérer tous les navires de longueur supérieure ou égale à 2 cases en seulement 50 tirs au lieu de 100.',
    },
    {
      question: 'Peut-on jouer à 2 en ligne gratuitement ?',
      answer:
        'Oui, Arcadeum permet de créer une salle et de partager un lien d’invitation pour jouer instantanément dans le navigateur sans téléchargement.',
    },
  ],
};
