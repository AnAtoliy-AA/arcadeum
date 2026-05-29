'use client';

import { memo } from 'react';
import { PlayerAvatar, type PlayerAvatarSize } from '@arcadeum/ui';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';

export interface EquippedPlayerAvatarProps {
  name: string;
  size?: PlayerAvatarSize;
  equippedAvatarId: string | null | undefined;
  equippedBadgeId: string | null | undefined;
  equippedNameColorId?: string | null | undefined;
  equippedFrameId?: string | null | undefined;
  equippedAuraId?: string | null | undefined;
  equippedBannerId?: string | null | undefined;
  equippedGameSkinId?: string | null | undefined;
  equippedBackgroundId?: string | null | undefined;
  /** Legacy `avatarUrl` from older payloads (pre-shop catalog). Used when the
   *  catalog doesn't resolve an equipped item. */
  fallbackAvatarUrl?: string;
  level?: number | null;
  presenceLine?: string;
  priority?: boolean;
  'data-testid'?: string;
  onPress?: () => void;
}

export const EquippedPlayerAvatar = memo(function EquippedPlayerAvatar(
  props: EquippedPlayerAvatarProps,
) {
  const cosmetics = useEquippedCosmetics({
    equippedAvatarId: props.equippedAvatarId,
    equippedBadgeId: props.equippedBadgeId,
    equippedNameColorId: props.equippedNameColorId,
    equippedFrameId: props.equippedFrameId,
    equippedAuraId: props.equippedAuraId,
    equippedBannerId: props.equippedBannerId,
    equippedGameSkinId: props.equippedGameSkinId,
    equippedBackgroundId: props.equippedBackgroundId,
  });
  const { t } = useTranslation();
  const skinChip = cosmetics.skinChip
    ? {
        id: cosmetics.skinChip.id,
        label: String(t(cosmetics.skinChip.label as TranslationKey)),
        prefix: t('common.cosmetics.skin'),
      }
    : null;
  return (
    <PlayerAvatar
      name={props.name}
      size={props.size}
      avatarUrl={cosmetics.avatarUrl ?? props.fallbackAvatarUrl ?? null}
      badgeUrl={cosmetics.badgeUrl}
      frameColor={cosmetics.frameColor}
      auraColor={cosmetics.auraColor}
      backgroundColor={cosmetics.backgroundColor}
      bannerColor={cosmetics.bannerColor}
      nameColor={cosmetics.nameColor}
      skinChip={skinChip}
      level={props.level}
      presenceLine={props.presenceLine}
      priority={props.priority}
      data-testid={props['data-testid']}
      onPress={props.onPress}
    />
  );
});
