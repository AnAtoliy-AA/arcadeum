export const shopEn = {
  meta: {
    title: 'Shop · Arcadeum',
    description: 'Avatars, badges, name colors and game skins.',
  },
  topBar: {
    eyebrow: 'Cosmetics market',
    title: 'Shop',
    nav: {
      shop: 'Shop',
      featured: 'Featured',
      inventory: 'Inventory',
      wallet: 'Wallet',
    },
    topUp: 'Top up',
  },
  signIn: {
    title: 'Sign in to buy and equip items',
    body: 'You can browse the catalog as a guest, but inventory and purchases require an account.',
    cta: 'Sign in',
  },
  hero: {
    tag: 'Limited drop',
    ends: 'Ends in {time}',
    tryOn: 'Try on',
    buyNow: 'Buy now',
    bodySuffix: 'Visible in lobby, chat, and during matches.',
  },
  mannequin: {
    tryOn: 'Try-on',
    stage: { level: 'LVL {level} · Online' },
    slots: {
      avatar: {
        label: 'Avatar',
        desc: 'Profile portrait shown in lobby and chat.',
        empty: 'Empty',
      },
      badge: {
        label: 'Badge',
        desc: 'Small icon next to your name in lists.',
        empty: 'Empty',
      },
      name_color: {
        label: 'Name color',
        desc: 'Color or gradient applied to your handle.',
        empty: 'Empty',
      },
      game_skin: {
        label: 'Game skin',
        desc: 'Visual theme inside matches.',
        empty: 'Empty',
      },
    },
    action: {
      previewingEyebrow: 'Previewing',
      selectedSlotEyebrow: 'Selected slot',
      loadoutEyebrow: 'Your loadout',
      equippedEyebrow: 'Equipped',
      idleTitle: 'Hover an item to try it on',
      idleBody:
        'Or tap a slot above to filter the catalog. Selling refunds 50% in coins.',
      buyEquip: 'Buy & equip',
      equip: 'Equip',
      unequip: 'Unequip',
      sell: 'Sell · 50%',
      clear: 'Clear selection',
      slotEmpty: 'Empty',
    },
    wallet: {
      nextPack: 'Next pack · {label}',
      ofTarget: '{current}/{target}',
    },
  },
  row: {
    avatars: {
      title: 'Avatars',
      eyebrow: '{count} items',
      viewAll: 'View all',
    },
    badges: {
      title: 'Badges',
      eyebrow: '{count} items',
      viewAll: 'View all',
    },
    colors: {
      title: 'Name colors',
      eyebrow: '{count} items',
      viewAll: 'View all',
    },
    skins: {
      title: 'Game skins',
      eyebrow: '{count} items',
      viewAll: 'View all',
    },
    legendary: {
      title: 'Legendary',
      eyebrow: 'Top rarity',
      viewAll: 'View all',
    },
    newdrops: {
      title: 'New drops',
      eyebrow: 'This week',
      viewAll: 'View all',
    },
  },
  card: { owned: 'Owned', equipped: 'Equipped', buyEquip: 'Buy & equip' },
  rarities: {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
  },
  purchase: {
    title: 'Confirm purchase',
    buy: 'Buy',
    cancel: 'Cancel',
    close: 'Close',
    yourBalance: 'You have {amount} {currency}.',
    free: 'Free',
    successTitle: 'Equipped',
    successBody: '{name} is now equipped.',
    errors: {
      insufficientFunds: "You don't have enough to buy this.",
      unavailable: "This item isn't available right now.",
      generic: "Couldn't complete the purchase. Try again.",
    },
  },
  sell: {
    title: 'Sell item',
    sell: 'Sell for {amount} coins',
    cancel: 'Cancel',
    refund: "You'll get {amount} coins back.",
    errors: {
      starterNotSellable: 'Starter items cannot be sold.',
      alreadySold: 'This item has already been sold.',
      unequipFirst: 'Unequip the item before selling.',
      generic: "Couldn't sell the item. Try again.",
    },
  },
  items: {
    avatar: {
      default01: { name: 'Default avatar', desc: 'The starter avatar.' },
      fox01: { name: 'Fox', desc: 'A clever fox.' },
      cat01: { name: 'Cat', desc: 'A curious cat.' },
      dragon01: { name: 'Dragon', desc: 'A fierce dragon.' },
      phoenix01: { name: 'Phoenix', desc: 'A rising phoenix.' },
      cosmic01: { name: 'Cosmic', desc: 'A cosmic legend.' },
    },
    badge: {
      newcomer: { name: 'Newcomer', desc: 'Welcome to Arcadeum.' },
      veteran: { name: 'Veteran', desc: 'A seasoned player.' },
      champion: { name: 'Champion', desc: 'A proven champion.' },
      legend: { name: 'Legend', desc: 'A legendary player.' },
    },
    name_color: {
      slate: { name: 'Slate', desc: 'A calm, cool gray.' },
      emerald: { name: 'Emerald', desc: 'A fresh emerald green.' },
      cyan: { name: 'Cyan', desc: 'An electric cyan.' },
      violet: { name: 'Violet', desc: 'A vivid violet.' },
      sunset: { name: 'Sunset', desc: 'A warm sunset gradient.' },
      aurora: { name: 'Aurora', desc: 'A shifting aurora gradient.' },
    },
  },
};

export type ShopI18n = typeof shopEn;
