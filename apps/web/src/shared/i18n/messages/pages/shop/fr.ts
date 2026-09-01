import { shopItemsFr } from './fr-items';

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
      rewards: 'Récompenses',
    },
    topUp: 'Recharger',
  },
  freeRewardsBanner: {
    title: 'Récompenses et quêtes gratuites',
    subtitle:
      'Abonnez-vous à nos réseaux officiels pour gagner des gemmes gratuites !',
    cta: 'Réclamer des gemmes',
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
        desc: 'Portrait de profil affiché dans le lobby and le chat.',
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
      background: {
        label: 'Arrière-plan',
        desc: 'Halo coloré derrière votre avatar.',
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
    backgrounds: {
      title: 'Arrière-plans',
      eyebrow: '{count} objets',
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
  items: shopItemsFr,
};
