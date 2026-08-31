import { shopItemsEs } from './es-items';

export const shopEs = {
  meta: {
    title: 'Tienda · Arcadeum',
    description: 'Avatares, insignias, colores de nombre y temas de partida.',
  },
  topBar: {
    eyebrow: 'Mercado de cosméticos',
    title: 'Tienda',
    nav: {
      shop: 'Tienda',
      inventory: 'Inventario',
      wallet: 'Monedero',
      rewards: 'Recompensas',
    },
    topUp: 'Recargar',
  },
  freeRewardsBanner: {
    title: 'Recompensas y misiones gratis',
    subtitle:
      '¡Suscríbete a nuestras redes sociales oficiales para ganar gemas gratis!',
    cta: 'Reclamar gemas',
  },
  signIn: {
    title: 'Inicia sesión para comprar y equipar artículos',
    body: 'Puedes explorar el catálogo como invitado, pero el inventario y las compras requieren una cuenta.',
    cta: 'Iniciar sesión',
  },
  hero: {
    tag: 'Drop limitado',
    tryOn: 'Probar',
    buyNow: 'Comprar ahora',
    bodySuffix: 'Visible en la sala, el chat y durante las partidas.',
  },
  mannequin: {
    tryOn: 'Probar',
    stage: { level: 'NIV {level} · En línea', online: 'En línea' },
    slots: {
      avatar: {
        label: 'Avatar',
        desc: 'Retrato de perfil mostrado en la sala y en el chat.',
        empty: 'Vacío',
      },
      badge: {
        label: 'Insignia',
        desc: 'Icono pequeño junto a tu nombre en las listas.',
        empty: 'Vacío',
      },
      name_color: {
        label: 'Color de nombre',
        desc: 'Color o degradado aplicado a tu nombre de usuario.',
        empty: 'Vacío',
      },
      game_skin: {
        label: 'Tema de partida',
        desc: 'Tema visual dentro de las salas de juego.',
        empty: 'Vacío',
      },
      banner: {
        label: 'Banner',
        desc: 'Fondo completo para tu perfil y podio de la sala.',
        empty: 'Vacío',
      },
      aura: {
        label: 'Aura',
        desc: 'Rayos brillantes en órbita alrededor de tu avatar en la sala y en las partidas.',
        empty: 'Vacío',
      },
      frame: {
        label: 'Marco',
        desc: 'Anillo decorativo que envuelve tu avatar.',
        empty: 'Vacío',
      },
      background: {
        label: 'Fondo',
        desc: 'Luz de color pintada detrás de tu avatar, dentro del marco.',
        empty: 'Vacío',
      },
    },
    action: {
      previewingEyebrow: 'Vista previa',
      selectedSlotEyebrow: 'Ranura seleccionada',
      loadoutEyebrow: 'Tu equipamiento',
      equippedEyebrow: 'Equipado',
      idleTitle: 'Pasa el cursor sobre un artículo para probarlo',
      idleBody:
        'O toca una ranura de arriba para filtrar el catálogo. Vender reembolsa el 50% en monedas.',
      buyEquip: 'Comprar y equipar',
      equip: 'Equipar',
      unequip: 'Desequipar',
      sell: 'Vender · 50%',
      clear: 'Limpiar selección',
      slotEmpty: 'Vacío',
    },
    wallet: {
      nextPack: 'Siguiente pack · {label}',
      ofTarget: '{current}/{target}',
    },
  },
  row: {
    avatars: {
      title: 'Avatares',
      eyebrow: '{count} artículos',
      viewAll: 'Ver todo',
      collapse: 'Contraer',
    },
    badges: {
      title: 'Insignias',
      eyebrow: '{count} artículos',
      viewAll: 'Ver todo',
      collapse: 'Contraer',
    },
    colors: {
      title: 'Colores de nombre',
      eyebrow: '{count} artículos',
      viewAll: 'Ver todo',
      collapse: 'Contraer',
    },
    skins: {
      title: 'Temas de partida',
      eyebrow: '{count} artículos',
      viewAll: 'Ver todo',
      collapse: 'Contraer',
    },
    banners: {
      title: 'Banners',
      eyebrow: '{count} artículos',
      viewAll: 'Ver todo',
      collapse: 'Contraer',
    },
    auras: {
      title: 'Auras',
      eyebrow: '{count} artículos',
      viewAll: 'Ver todo',
      collapse: 'Contraer',
    },
    frames: {
      title: 'Marcos',
      eyebrow: '{count} artículos',
      viewAll: 'Ver todo',
      collapse: 'Contraer',
    },
    backgrounds: {
      title: 'Fondos',
      eyebrow: '{count} artículos',
      viewAll: 'Ver todo',
      collapse: 'Contraer',
    },
    legendary: {
      title: 'Legendario',
      eyebrow: 'Rareza superior',
      viewAll: 'Ver todo',
      collapse: 'Contraer',
    },
  },
  card: {
    owned: 'Comprado',
    equipped: 'Equipado',
    buyEquip: 'Comprar y equipar',
    equip: 'Equipar',
    unequip: 'Desequipar',
    sell: 'Vender · 50%',
  },
  inventory: {
    title: 'Inventario',
    eyebrow: '{count} en propiedad',
    empty: 'Aún no tienes nada en propiedad.',
  },
  rarities: {
    common: 'Común',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Legendario',
  },
  empty: {
    title: 'La tienda no está disponible en este momento',
    body: 'Estamos trabajando en ello. Inténtalo de nuevo en un minuto.',
  },
  purchase: {
    title: 'Confirmar compra',
    buy: 'Comprar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    yourBalance: 'Tienes {amount} {currency}.',
    free: 'Gratis',
    successTitle: 'Equipado',
    successBody: '{name} ha sido equipado.',
    errors: {
      insufficientFunds: 'No tienes suficiente para comprar esto.',
      unavailable: 'Este artículo no está disponible actualmente.',
      generic: 'No se pudo completar la compra. Inténtalo de nuevo.',
    },
  },
  sell: {
    title: 'Vender artículo',
    sell: 'Vender por {amount} monedas',
    cancel: 'Cancelar',
    refund: 'Recibirás {amount} monedas.',
    errors: {
      starterNotSellable: 'Los artículos iniciales no se pueden vender.',
      alreadySold: 'Este artículo ya fue vendido.',
      unequipFirst: 'Desequipa el artículo antes de venderlo.',
      generic: 'No se pudo vender el artículo. Inténtalo de nuevo.',
    },
  },
  items: shopItemsEs,
};
