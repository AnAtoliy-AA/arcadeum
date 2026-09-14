import type {
  EquippedView,
  InventoryItemView,
  InventoryRowSnapshot,
  LeanUser,
} from '../interfaces/shop-views';

export function equippedFromUser(
  user: LeanUser | null | undefined,
): EquippedView {
  return {
    avatar: user?.equippedAvatarId ?? null,
    badge: user?.equippedBadgeId ?? null,
    name_color: user?.equippedNameColorId ?? null,
    game_skin: user?.equippedGameSkinId ?? null,
    banner: user?.equippedBannerId ?? null,
    aura: user?.equippedAuraId ?? null,
    frame: user?.equippedFrameId ?? null,
    background: user?.equippedBackgroundId ?? null,
  };
}

export function toInventoryItemView(
  row: InventoryRowSnapshot,
): InventoryItemView {
  return {
    rowId: row._id.toString(),
    itemId: row.itemId,
    purchaseId: row.purchaseId,
    acquiredVia: row.acquiredVia,
    paidAmount: row.paidAmount ?? null,
    paidCurrency: row.paidCurrency ?? null,
    soldAt: row.soldAt ? row.soldAt.toISOString() : null,
    createdAt: (row.createdAt ?? new Date()).toISOString(),
  };
}
