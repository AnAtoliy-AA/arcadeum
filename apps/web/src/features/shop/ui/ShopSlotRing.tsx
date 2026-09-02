'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import { Typography } from '@arcadeum/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { ItemAsset } from './ItemAsset';
import type { EffectiveShopItem, ShopCategory } from '../server/shop.types';

export interface ShopSlotLabels {
  label: string;
  desc: string;
  empty: string;
}

export interface ShopSlotRingLabels {
  avatar: ShopSlotLabels;
  badge: ShopSlotLabels;
  name_color: ShopSlotLabels;
  game_skin: ShopSlotLabels;
  banner: ShopSlotLabels;
  aura: ShopSlotLabels;
  frame: ShopSlotLabels;
  background: ShopSlotLabels;
}

export interface ShopSlotRingProps {
  preview: Record<ShopCategory, EffectiveShopItem | null | undefined>;
  activeSlot: ShopCategory | null;
  hoverItem: EffectiveShopItem | null;
  labels: ShopSlotRingLabels;
  onSlotClick: (slot: ShopCategory) => void;
}

const SLOT_ORDER: ShopCategory[] = [
  'avatar',
  'frame',
  'background',
  'badge',
  'banner',
  'aura',
  'name_color',
  'game_skin',
];

function SlotTile({
  active,
  previewing,
  className,
  onClick,
  role,
  tabIndex,
  'data-testid': dataTestId,
  'data-active': dataActive,
  'data-previewing': dataPreviewing,
  children,
}: {
  active?: boolean;
  previewing?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  role?: string;
  tabIndex?: number;
  'data-testid'?: string;
  'data-active'?: string;
  'data-previewing'?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      data-testid={dataTestId}
      data-active={dataActive}
      data-previewing={dataPreviewing}
      className={cx(
        'flex flex-row items-center gap-[10px] p-[10px] rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] cursor-pointer min-h-[62px] transition-colors hover:border-[var(--glassBorderHover)] hover:bg-[var(--glassBgHover)]',
        active && 'border-blue-400/60 bg-blue-500/10',
        previewing && 'border-emerald-500/60 bg-emerald-500/10',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ShopSlotRing({
  preview,
  activeSlot,
  hoverItem,
  labels,
  onSlotClick,
}: ShopSlotRingProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col items-stretch gap-2"
      data-testid="shop-slot-ring"
    >
      <div className="flex flex-row items-stretch flex-wrap gap-2">
        {SLOT_ORDER.map((slot) => {
          const slotLabels = labels[slot];
          const item = preview[slot] ?? null;
          const isActive = activeSlot === slot;
          const isPreviewing = hoverItem?.category === slot;
          const itemName = item
            ? String(t(`pages.shop.${item.nameKey}` as TranslationKey))
            : slotLabels.empty;

          return (
            <SlotTile
              key={slot}
              active={isActive}
              previewing={isPreviewing}
              onClick={() => onSlotClick(slot)}
              role="button"
              tabIndex={0}
              data-testid={`shop-slot-${slot}`}
              data-active={isActive ? 'true' : 'false'}
              data-previewing={isPreviewing ? 'true' : 'false'}
              className="w-[48%] max-[800px]:w-full"
            >
              <div className="flex flex-col w-[40px] h-[40px] rounded-lg items-center justify-center bg-[var(--backgroundHover)] border border-[var(--glassBorder)] overflow-hidden">
                {item ? (
                  <ItemAsset item={item} size={32} />
                ) : (
                  <Typography uiSize="xl" color="#6b7280">
                    ·
                  </Typography>
                )}
              </div>
              <div className="flex flex-col items-stretch flex-1 min-w-0 gap-2">
                <Typography
                  uiSize="xs"
                  variant="label"
                  color="var(--textSecondary)"
                  tracking="sm"
                  className="uppercase"
                >
                  {slotLabels.label}
                </Typography>
                <Typography
                  uiSize="xs"
                  weight="700"
                  color="var(--color)"
                  className="line-clamp-1"
                >
                  {itemName}
                </Typography>
              </div>
            </SlotTile>
          );
        })}
      </div>
    </div>
  );
}
