import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-sea-battle',
  locale: 'fr',
  title:
    'Comment jouer à la Bataille navale (Battleship) en ligne — Règles, placement, stratégie',
  excerpt:
    'Guide complet pour débutants : règles officielles, placement de la flotte, recherche hunt-and-target, et les habitudes qui séparent un joueur occasionnel de l’amiral qui coule en premier.',
  publishedAt: '2026-05-21',
  author: 'Équipe Arcadeum',
  tags: [
    'Bataille navale',
    'Battleship',
    'Comment jouer',
    'Stratégie',
    'Tutoriel',
  ],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: "La Bataille navale — connue dans le monde sous le nom de Battleship — est l'un des plus anciens jeux de stratégie sur grille encore activement pratiqués. Deux adversaires placent secrètement une flotte sur une grille 10×10, puis tirent chacun leur tour sur des coordonnées du plateau adverse. Le premier qui coule toute la flotte ennemie gagne. Les règles s'expliquent en deux minutes, mais quelques petites habitudes séparent un joueur occasionnel de l'amiral qui coule en premier. Ce guide couvre les règles officielles, la flotte standard et les stratégies de placement et de recherche qui font réellement gagner — le tout orienté vers la pratique en ligne.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Mise en place : la grille 10×10 et la flotte standard',
      id: 'setup',
    },
    {
      type: 'paragraph',
      text: 'Chaque joueur a deux grilles 10×10 : une Grille Océan où il place sa propre flotte et une Grille Cible où il note touches et ratés sur celle de l’adversaire. Les colonnes vont de A à J, les lignes de 1 à 10, donc toute case s’adresse par une coordonnée comme B7 ou J3. La flotte canonique : un Porte-avions (5 cases), un Cuirassé (4), un Croiseur (3), un Sous-marin (3) et un Destroyer (2) — 17 cases de navires sur les 100 de la grille.',
    },
    {
      type: 'paragraph',
      text: "Les navires se placent orthogonalement — en ligne droite, horizontale ou verticale — sans se chevaucher. Savoir s'ils peuvent se toucher par les bords est la variante maison la plus courante : interdit en tournoi, souvent autorisé en partie occasionnelle. Convenez d'une règle avec votre adversaire avant la première salve. Sur Arcadeum, un sélecteur permet de choisir la règle à appliquer.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Comment se déroule un tour',
      id: 'turn',
    },
    {
      type: 'paragraph',
      text: "À votre tour vous annoncez une coordonnée (par exemple F6). L'adversaire regarde sa Grille Océan, déclare « touché » ou « à l'eau » et marque la case. Vous marquez la même coordonnée sur votre Grille Cible — rouge pour touché, blanc pour raté — et vous construisez une carte de l'endroit où doit se trouver la flotte ennemie. Quand toutes les cases d'un navire sont touchées, le propriétaire annonce le coulage (« Vous avez coulé mon Croiseur »), une information cruciale car elle confirme que les cases voisines sont désormais sûres et peuvent être ignorées.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Placement : trois habitudes pour commencer',
      id: 'placement',
    },
    {
      type: 'list',
      items: [
        'Étalez, ne regroupez pas. Placez chaque navire dans son propre quadrant quand vous pouvez. Les flottes regroupées s’effondrent — une touche chanceuse offre deux ou trois coulages successifs.',
        'Évitez les bords. Coller la flotte au bord paraît sûr, mais les adversaires expérimentés balaient le périmètre en premier parce que les navires de bord ont moins de directions d’évasion. Décalez la flotte d’une ou deux cases.',
        'Mélangez les orientations. Si les cinq navires sont horizontaux, une recherche verticale les traverse tous. Orientez au moins deux navires différemment pour qu’aucun motif unique ne couvre toute la flotte.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Recherche : damier d’abord, puis hunt-and-target',
      id: 'search',
    },
    {
      type: 'paragraph',
      text: 'Tant que vous n’avez pas la première touche, vous cherchez. Le motif le plus efficace est un damier — tirer sur une case sur deux. Le navire le plus court mesure deux cases, donc un motif en damier garantit que vous toucherez tôt ou tard chaque navire sans scanner toutes les cases. Cela réduit de moitié le nombre de cases à essayer avant le premier coup au but.',
    },
    {
      type: 'paragraph',
      text: 'Après la première touche, passez en hunt-and-target. Tirez sur les quatre cases adjacentes jusqu’à obtenir une nouvelle touche, puis continuez le long de cette ligne jusqu’au coulage. Dès que le navire coule, revenez au damier — vous savez maintenant que les cases autour du navire coulé sont également sûres, un gain de réduction d’espace plus important qu’il n’y paraît.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Notez les ratés, pas seulement les touches',
      id: 'misses',
    },
    {
      type: 'paragraph',
      text: 'Les ratés sont de l’information. Chaque raté vous dit que cette case ne contient pas de navire et réduit l’espace de recherche d’une case. À mi-partie, les zones de ratés esquissent souvent les régions où les navires restants doivent se trouver. Les implémentations en ligne affichent les ratés en permanence, mais le principe reste le même : chaque tir produit une information exploitable pour le suivant.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Variantes fréquentes en ligne',
      id: 'variants',
    },
    {
      type: 'list',
      items: [
        'Salve. À chaque tour, vous tirez autant de coups que de navires survivants, simultanément. Accélère beaucoup la fin de partie.',
        'Mode équipe. 2 contre 2 ou plus, avec grilles partagées et chat d’équipe. La coordination devient la compétence dominante.',
        'Navires cachés. Les coulages ne sont pas annoncés — vous ne le savez qu’en touchant la dernière case. Très exigeant mais gratifiant.',
        'Plateaux thématiques. Habillages visuels (cartes vintage, cyberpunk néon, espace profond). Les règles ne changent pas.',
      ],
    },
    {
      type: 'cta',
      href: '/games/sea-battle',
      text: 'Jouer à la Bataille navale en ligne — gratuit, dans le navigateur',
      description:
        'Créez un salon, partagez le lien avec des amis ou remplissez les places avec des bots IA. Toutes les variantes ci-dessus sont disponibles.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Résumé — les quatre habitudes qui gagnent',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Placez les navires loin des bords et dans des quadrants distincts.',
        'Recherchez en damier jusqu’à la première touche.',
        'Après une touche, hunt-and-target le long de la ligne jusqu’au coulage, puis retour au damier.',
        'Suivez les ratés avec autant d’attention que les touches — ils disent où les navires ne sont pas.',
      ],
    },
    {
      type: 'paragraph',
      text: 'La Bataille navale est un jeu où les petites habitudes constantes se cumulent en un véritable avantage. Les règles sont assez anciennes pour qu’il n’existe aucune stratégie secrète — mais les quatre habitudes ci-dessus sont assez robustes pour qu’un joueur qui les applique toutes surpasse un joueur qui n’en applique aucune, à chaque fois. Jouez quelques manches, mesurez vos progrès et ajustez.',
    },
  ],
};
