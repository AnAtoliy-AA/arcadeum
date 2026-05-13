export const shopEn = {
  meta: {
    title: 'Shop · Arcadeum',
    description: 'Spend your coins and gems on avatars, badges, and more.',
  },
  title: 'Shop',
  subtitle: 'Avatars and badges to make your profile your own.',
  sidebar: {
    title: 'Filters',
    category: 'Category',
    rarity: 'Rarity',
    all: 'All',
    categories: {
      avatar: 'Avatars',
      badge: 'Badges',
      name_color: 'Name colors',
      game_skin: 'Game skins',
    },
    rarities: {
      common: 'Common',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary',
    },
    tabs: { browse: 'Browse', inventory: 'Inventory' },
  },
  grid: {
    emptyCategory: 'Nothing here yet. Check back soon.',
    purchase: {
      title: 'Confirm purchase',
      buy: 'Buy',
      cancel: 'Cancel',
      yourBalance: 'You have {amount} {currency}.',
      free: 'Free',
      errors: {
        insufficientFunds: "You don't have enough to buy this.",
        unavailable: "This item isn't available right now.",
        generic: "Couldn't complete the purchase. Try again.",
      },
    },
  },
  inventory: {
    emptyInventory: 'Your inventory is empty. Browse the shop to get started.',
    equip: 'Equip',
    unequip: 'Unequip',
    sell: 'Sell',
    starterTag: 'Starter',
    sell_modal: {
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
  },
};

export type ShopI18n = typeof shopEn;
