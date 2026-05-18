export const shopFr = {
  meta: {
    title: 'Boutique · Arcadeum',
    description: 'Avatars, badges, couleurs de nom et skins de jeu.',
  },
  topBar: {
    eyebrow: 'Marché de cosmétiques',
    title: 'Boutique',
    nav: {
      shop: 'Boutique',
      featured: 'En vedette',
      inventory: 'Inventaire',
      wallet: 'Portefeuille',
    },
    topUp: 'Recharger',
  },
  signIn: {
    title: 'Connectez-vous pour acheter et équiper',
    body: 'Vous pouvez parcourir le catalogue en tant qu’invité, mais l’inventaire et les achats nécessitent un compte.',
    cta: 'Se connecter',
  },
  hero: {
    tag: 'Drop limité',
    ends: 'Se termine dans {time}',
    tryOn: 'Essayer',
    buyNow: 'Acheter',
    bodySuffix: 'Visible dans le lobby, le chat et pendant les matchs.',
  },
  mannequin: {
    tryOn: 'Essai',
    stage: { level: 'NIV {level} · En ligne' },
    slots: {
      avatar: {
        label: 'Avatar',
        desc: 'Portrait de profil affiché dans le lobby et le chat.',
        empty: 'Vide',
      },
      badge: {
        label: 'Badge',
        desc: 'Petite icône à côté de votre nom dans les listes.',
        empty: 'Vide',
      },
      name_color: {
        label: 'Couleur du nom',
        desc: 'Couleur ou dégradé appliqué à votre nom.',
        empty: 'Vide',
      },
      game_skin: {
        label: 'Skin de jeu',
        desc: 'Thème visuel dans les matchs.',
        empty: 'Vide',
      },
    },
    action: {
      previewingEyebrow: 'Aperçu',
      selectedSlotEyebrow: 'Slot sélectionné',
      loadoutEyebrow: 'Votre équipement',
      equippedEyebrow: 'Équipé',
      idleTitle: 'Survolez un article pour l’essayer',
      idleBody:
        'Ou touchez un slot ci-dessus pour filtrer le catalogue. La vente rembourse 50% en pièces.',
      buyEquip: 'Acheter et équiper',
      equip: 'Équiper',
      unequip: 'Déséquiper',
      sell: 'Vendre · 50%',
      clear: 'Effacer la sélection',
      slotEmpty: 'Vide',
    },
    wallet: {
      nextPack: 'Prochain pack · {label}',
      ofTarget: '{current}/{target}',
    },
  },
  row: {
    avatars: {
      title: 'Avatars',
      eyebrow: '{count} articles',
      viewAll: 'Tout voir',
    },
    badges: {
      title: 'Badges',
      eyebrow: '{count} articles',
      viewAll: 'Tout voir',
    },
    colors: {
      title: 'Couleurs de nom',
      eyebrow: '{count} articles',
      viewAll: 'Tout voir',
    },
    skins: {
      title: 'Skins de jeu',
      eyebrow: '{count} articles',
      viewAll: 'Tout voir',
    },
    legendary: {
      title: 'Légendaires',
      eyebrow: 'Rareté max',
      viewAll: 'Tout voir',
    },
    newdrops: {
      title: 'Nouveaux drops',
      eyebrow: 'Cette semaine',
      viewAll: 'Tout voir',
    },
  },
  card: {
    owned: 'Possédé',
    equipped: 'Équipé',
    buyEquip: 'Acheter et équiper',
  },
  rarities: {
    common: 'Commun',
    rare: 'Rare',
    epic: 'Épique',
    legendary: 'Légendaire',
  },
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
  sell: {
    title: "Vendre l'article",
    sell: 'Vendre pour {amount} pièces',
    cancel: 'Annuler',
    refund: 'Vous récupérerez {amount} pièces.',
    errors: {
      starterNotSellable: 'Les articles de départ ne peuvent pas être vendus.',
      alreadySold: 'Cet article a déjà été vendu.',
      unequipFirst: "Déséquipez l'article avant de le vendre.",
      generic: "Impossible de vendre l'article. Réessayez.",
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
    name_color: {
      slate: { name: 'Ardoise', desc: 'Un gris calme et frais.' },
      emerald: { name: 'Émeraude', desc: 'Un vert émeraude éclatant.' },
      cyan: { name: 'Cyan', desc: 'Un cyan électrique.' },
      violet: { name: 'Violet', desc: 'Un violet vif.' },
      sunset: {
        name: 'Coucher de soleil',
        desc: 'Un dégradé chaud de coucher de soleil.',
      },
      aurora: {
        name: 'Aurore',
        desc: 'Un dégradé changeant d’aurore boréale.',
      },
    },
  },
};
