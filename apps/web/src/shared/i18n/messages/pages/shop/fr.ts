export const shopFr = {
  meta: {
    title: 'Boutique · Arcadeum',
    description:
      'Dépensez vos pièces et gemmes pour des avatars, des badges et plus.',
  },
  title: 'Boutique',
  subtitle: 'Avatars et badges pour personnaliser votre profil.',
  signIn: {
    title: 'Connectez-vous pour acheter et équiper',
    body: 'Vous pouvez parcourir le catalogue en tant qu’invité, mais l’inventaire et les achats nécessitent un compte.',
    cta: 'Se connecter',
  },
  sidebar: {
    title: 'Filtres',
    category: 'Catégorie',
    rarity: 'Rareté',
    all: 'Tous',
    categories: {
      avatar: 'Avatars',
      badge: 'Badges',
      name_color: 'Couleurs de nom',
      game_skin: 'Skins de jeu',
    },
    rarities: {
      common: 'Commun',
      rare: 'Rare',
      epic: 'Épique',
      legendary: 'Légendaire',
    },
    tabs: { browse: 'Parcourir', inventory: 'Inventaire' },
  },
  grid: {
    emptyCategory: 'Rien ici pour le moment. Revenez bientôt.',
    purchase: {
      title: "Confirmer l'achat",
      buy: 'Acheter',
      cancel: 'Annuler',
      close: 'Fermer',
      yourBalance: 'Vous avez {amount} {currency}.',
      free: 'Gratuit',
      successTitle: 'Équipé',
      successBody: '{name} est maintenant équipé.',
      errors: {
        insufficientFunds: "Vous n'avez pas assez pour acheter ceci.",
        unavailable: "Cet article n'est pas disponible actuellement.",
        generic: "Impossible de terminer l'achat. Réessayez.",
      },
    },
    equipped: 'Équipé',
  },
  inventory: {
    emptyInventory:
      'Votre inventaire est vide. Visitez la boutique pour commencer.',
    equip: 'Équiper',
    unequip: 'Déséquiper',
    sell: 'Vendre',
    starterTag: 'Débutant',
    sell_modal: {
      title: "Vendre l'article",
      sell: 'Vendre pour {amount} pièces',
      cancel: 'Annuler',
      refund: 'Vous récupérerez {amount} pièces.',
      errors: {
        starterNotSellable:
          'Les articles de départ ne peuvent pas être vendus.',
        alreadySold: 'Cet article a déjà été vendu.',
        unequipFirst: "Déséquipez l'article avant de le vendre.",
        generic: "Impossible de vendre l'article. Réessayez.",
      },
    },
  },
  items: {
    avatar: {
      default01: { name: 'Avatar par défaut', desc: "L'avatar de départ." },
      fox01: { name: 'Renard', desc: 'Un renard rusé.' },
      cat01: { name: 'Chat', desc: 'Un chat curieux.' },
      dragon01: { name: 'Dragon', desc: 'Un dragon féroce.' },
      phoenix01: { name: 'Phénix', desc: 'Un phénix renaissant.' },
      cosmic01: { name: 'Cosmique', desc: 'Une légende cosmique.' },
    },
    badge: {
      newcomer: { name: 'Nouveau venu', desc: 'Bienvenue sur Arcadeum.' },
      veteran: { name: 'Vétéran', desc: 'Un joueur expérimenté.' },
      champion: { name: 'Champion', desc: 'Un champion confirmé.' },
      legend: { name: 'Légende', desc: 'Un joueur légendaire.' },
    },
  },
};
