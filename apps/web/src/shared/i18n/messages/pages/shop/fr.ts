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
    tryOn: 'Essayer',
    buyNow: 'Acheter',
    bodySuffix: 'Visible dans le lobby, le chat et pendant les matchs.',
  },
  mannequin: {
    tryOn: 'Essai',
    stage: { level: 'NIV {level} · En ligne', online: 'En ligne' },
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
      banner: {
        label: 'Bannière',
        desc: 'Arrière-plan complet de votre scène de profil et de lobby.',
        empty: 'Vide',
      },
      aura: {
        label: 'Aura',
        desc: 'Rayons scintillants qui orbitent autour de votre avatar dans le lobby et les matchs.',
        empty: 'Vide',
      },
      frame: {
        label: 'Cadre',
        desc: 'Anneau décoratif qui entoure votre avatar.',
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
      collapse: 'Réduire',
    },
    badges: {
      title: 'Badges',
      eyebrow: '{count} articles',
      viewAll: 'Tout voir',
      collapse: 'Réduire',
    },
    colors: {
      title: 'Couleurs de nom',
      eyebrow: '{count} articles',
      viewAll: 'Tout voir',
      collapse: 'Réduire',
    },
    skins: {
      title: 'Skins de jeu',
      eyebrow: '{count} articles',
      viewAll: 'Tout voir',
      collapse: 'Réduire',
    },
    banners: {
      title: 'Bannières',
      eyebrow: '{count} articles',
      viewAll: 'Tout voir',
      collapse: 'Réduire',
    },
    auras: {
      title: 'Auras',
      eyebrow: '{count} articles',
      viewAll: 'Tout voir',
      collapse: 'Réduire',
    },
    frames: {
      title: 'Cadres',
      eyebrow: '{count} articles',
      viewAll: 'Tout voir',
      collapse: 'Réduire',
    },
    legendary: {
      title: 'Légendaires',
      eyebrow: 'Rareté max',
      viewAll: 'Tout voir',
      collapse: 'Réduire',
    },
  },
  card: {
    owned: 'Possédé',
    equipped: 'Équipé',
    buyEquip: 'Acheter et équiper',
    equip: 'Équiper',
    unequip: 'Déséquiper',
    sell: 'Vendre · 50%',
  },
  inventory: {
    title: 'Inventaire',
    eyebrow: '{count} articles',
    empty: 'Vous ne possédez encore rien.',
  },
  rarities: {
    common: 'Commun',
    rare: 'Rare',
    epic: 'Épique',
    legendary: 'Légendaire',
  },
  empty: {
    title: 'La boutique est indisponible',
    body: 'On y travaille. Réessayez dans une minute.',
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
      wolf01: {
        name: 'Loup Cybernétique',
        desc: 'Un loup cybernétique hyperréaliste.',
      },
      panther01: {
        name: 'Panthère Cybernétique',
        desc: 'Une panthère cybernétique hyperréaliste.',
      },
      tiger01: {
        name: 'Tigre Cybernétique',
        desc: 'Un tigre cybernétique hyperréaliste.',
      },
      eagle01: {
        name: 'Aigle Cybernétique',
        desc: 'Un aigle cybernétique hyperréaliste.',
      },
    },
    badge: {
      newcomer: { name: 'Nouveau venu', desc: 'Bienvenue sur Arcadeum.' },
      veteran: { name: 'Vétéran', desc: 'Un joueur expérimenté.' },
      champion: { name: 'Champion', desc: 'Un champion confirmé.' },
      legend: { name: 'Légende', desc: 'Un joueur légendaire.' },
      elite: {
        name: 'Bouclier d’Élite',
        desc: 'Un bouclier cybernétique prestigieux.',
      },
      mythic: {
        name: 'Étoile Mythique',
        desc: 'Un emblème d’étoile céleste dorée.',
      },
      vanguard: {
        name: 'Bouclier de l’Avant-garde',
        desc: 'Un blason défensif blindé.',
      },
      nexus: {
        name: 'Étoile du Nexus',
        desc: 'Une puissante étoile cosmique futuriste.',
      },
    },
    name_color: {
      default: { name: 'Par défaut', desc: 'La couleur de nom initiale.' },
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
    game_skin: {
      default: { name: 'Par défaut', desc: 'Le thème de jeu initial.' },
    },
    banner: {
      default: { name: 'Par défaut', desc: 'L’arrière-plan initial.' },
      slate: { name: 'Ardoise', desc: 'Un arrière-plan gris ardoise sobre.' },
      tide: { name: 'Marée', desc: 'Un dégradé frais turquoise vers cyan.' },
      twilight: { name: 'Crépuscule', desc: 'Indigo fondu dans un rose intense.' },
      nebula: { name: 'Nébuleuse', desc: 'Un dégradé cosmique multicolore.' },
    },
    aura: {
      default: { name: 'Par défaut', desc: 'L’aura initiale.' },
      silver: { name: 'Aura argentée', desc: 'Un halo argenté subtil.' },
      cyan: { name: 'Aura cyan', desc: 'Un éclat électrique net.' },
      violet: { name: 'Aura violette', desc: 'Un éclat violet riche.' },
      prism: { name: 'Aura prisme', desc: 'Une radiance prismatique changeante.' },
    },
    frame: {
      default: { name: 'Par défaut', desc: 'Le cadre initial.' },
      silver: { name: 'Cadre argenté', desc: 'Un anneau argenté brossé.' },
      emerald: { name: 'Cadre émeraude', desc: 'Un anneau émeraude vif.' },
      violet: { name: 'Cadre violet', desc: 'Un anneau violet poli.' },
      prism: { name: 'Cadre prisme', desc: 'Un anneau prismatique changeant.' },
    },
  },
};
