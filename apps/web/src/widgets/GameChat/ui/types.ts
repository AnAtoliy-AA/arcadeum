export interface ResolvedEquipped {
  equippedAvatarId: string | null;
  equippedBadgeId: string | null;
  equippedNameColorId?: string | null;
  equippedFrameId?: string | null;
  equippedAuraId?: string | null;
  equippedBannerId?: string | null;
}

export type EquippedResolver = (id?: string | null) => ResolvedEquipped | null;
