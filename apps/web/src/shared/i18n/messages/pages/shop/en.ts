import { shopItemsEn } from './en-items';

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
      inventory: 'Inventory',
      wallet: 'Wallet',
      rewards: 'Rewards',
    },
    topUp: 'Top up',
  },
  freeRewardsBanner: {
    title: 'Free Rewards & Quests',
    subtitle:
      'Subscribe to our official social networks to earn free gems and bonus coins!',
    cta: 'Claim Free Gems',
  },
  signIn: {
    title: 'Sign in to buy & equip items',
    body: 'You can browse the catalog as a guest, but loadouts and purchasing require an account.',
    cta: 'Sign In',
  },
  hero: {
    tag: 'Limited Drop',
    tryOn: 'Try On',
    buyNow: 'Buy Now',
    bodySuffix: 'Visible in the lobby, chat, and during matches.',
  },
  mannequin: {
    tryOn: 'Try On',
    stage: { level: 'LVL {level} · Online', online: 'Online' },
    slots: {
      avatar: {
        label: 'Avatar',
        desc: 'Profile portrait displayed in the lobby and chat.',
        empty: 'Empty',
      },
      badge: {
        label: 'Badge',
        desc: 'Small icon next to your name in lists.',
        empty: 'Empty',
      },
      name_color: {
        label: 'Name Color',
        desc: 'Color or gradient applied to your username.',
        empty: 'Empty',
      },
      game_skin: {
        label: 'Game Theme',
        desc: 'Visual theme inside game rooms.',
        empty: 'Empty',
      },
      banner: {
        label: 'Banner',
        desc: 'Full backdrop for your profile and lobby podium.',
        empty: 'Empty',
      },
      aura: {
        label: 'Aura',
        desc: 'Glowing rays orbiting your avatar in lobby and matches.',
        empty: 'Empty',
      },
      frame: {
        label: 'Frame',
        desc: 'Decorative ring wrapping around your avatar.',
        empty: 'Empty',
      },
      background: {
        label: 'Backdrop',
        desc: 'Colored wash painted behind your avatar inside the frame.',
        empty: 'Empty',
      },
    },
    action: {
      previewingEyebrow: 'Previewing',
      selectedSlotEyebrow: 'Selected Slot',
      loadoutEyebrow: 'Your Loadout',
      equippedEyebrow: 'Equipped',
      idleTitle: 'Hover over any item to try it on',
      idleBody:
        'Or tap a slot above to filter the catalog. Selling refunds 50% in coins.',
      buyEquip: 'Buy & Equip',
      equip: 'Equip',
      unequip: 'Unequip',
      sell: 'Sell · 50%',
      clear: 'Clear Selection',
      slotEmpty: 'Empty',
    },
    wallet: {
      nextPack: 'Next Pack · {label}',
      ofTarget: '{current}/{target}',
    },
  },
  row: {
    avatars: {
      title: 'Avatars',
      eyebrow: '{count} items',
      viewAll: 'View All',
      collapse: 'Collapse',
    },
    badges: {
      title: 'Badges',
      eyebrow: '{count} items',
      viewAll: 'View All',
      collapse: 'Collapse',
    },
    colors: {
      title: 'Name Colors',
      eyebrow: '{count} items',
      viewAll: 'View All',
      collapse: 'Collapse',
    },
    skins: {
      title: 'Game Themes',
      eyebrow: '{count} items',
      viewAll: 'View All',
      collapse: 'Collapse',
    },
    banners: {
      title: 'Banners',
      eyebrow: '{count} items',
      viewAll: 'View All',
      collapse: 'Collapse',
    },
    auras: {
      title: 'Auras',
      eyebrow: '{count} items',
      viewAll: 'View All',
      collapse: 'Collapse',
    },
    frames: {
      title: 'Frames',
      eyebrow: '{count} items',
      viewAll: 'View All',
      collapse: 'Collapse',
    },
    backgrounds: {
      title: 'Backdrops',
      eyebrow: '{count} items',
      viewAll: 'View All',
      collapse: 'Collapse',
    },
    legendary: {
      title: 'Legendary',
      eyebrow: 'Top Tier Rarity',
      viewAll: 'View All',
      collapse: 'Collapse',
    },
  },
  card: {
    owned: 'Owned',
    equipped: 'Equipped',
    buyEquip: 'Buy & Equip',
    equip: 'Equip',
    unequip: 'Unequip',
    sell: 'Sell · 50%',
  },
  inventory: {
    title: 'Inventory',
    eyebrow: '{count} owned',
    empty: 'You do not own anything yet.',
  },
  rarities: {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
  },
  empty: {
    title: 'Shop is currently unavailable',
    body: 'We are working on it. Try again in a minute.',
  },
  purchase: {
    title: 'Confirm Purchase',
    buy: 'Buy',
    cancel: 'Cancel',
    close: 'Close',
    yourBalance: 'You have {amount} {currency}.',
    free: 'Free',
    successTitle: 'Equipped',
    successBody: '{name} has been equipped.',
    errors: {
      insufficientFunds: "You don't have enough to buy this.",
      unavailable: 'This item is not currently available.',
      generic: 'Failed to complete purchase. Try again.',
    },
  },
  sell: {
    title: 'Sell Item',
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
  items: shopItemsEn,
};

export type ShopI18n = typeof shopEn;
