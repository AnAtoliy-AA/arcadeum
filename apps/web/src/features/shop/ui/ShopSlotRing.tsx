'use client';

import { cx } from '@arcadeum/ui/utils/cx';
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
  ...props
}: {
  active?: boolean;
  previewing?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center gap-[10px] p-[10px] rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] cursor-pointer min-h-[62px] transition-colors hover:border-[rgba(255,255,255,0.22)] hover:bg-[rgba(255,255,255,0.04)]',
        active && 'border-[rgba(96,165,250,0.6)] bg-[rgba(96,165,250,0.08)]',
        previewing && 'border-[rgba(34,197,94,0.6)] bg-[rgba(16,185,129,0.10)]',
        className,
      )}
      {...props}
    />
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
      className="box-border flex flex-col items-stretch gap-2"
      data-testid="shop-slot-ring"
    >
      <div className="box-border flex flex-row items-stretch flex-wrap gap-2">
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
              <div className="box-border flex flex-col w-[40px] h-[40px] rounded-lg items-center justify-center bg-[rgba(0,0,0,0.30)] border border-[rgba(255,255,255,0.10)] overflow-hidden">
                {item ? (
                  <ItemAsset item={item} size={32} />
                ) : (
                  <span className="box-border text-[20px] text-[#6b7280]">
                    ·
                  </span>
                )}
              </div>
              <div className="box-border flex flex-col items-stretch flex-1 min-w-0 gap-2">
                <span className="box-border text-[40px] tracking-[1.2px] uppercase font-extrabold text-[#94a3b8]">
                  {slotLabels.label}
                </span>
                <span className="box-border text-[12px] font-bold text-[#f5f7ff] line-clamp-1">
                  {itemName}
                </span>
              </div>
            </SlotTile>
          );
        })}
      </div>
    </div>
  );
}
