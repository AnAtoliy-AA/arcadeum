'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cx } from '@arcadeum/ui/utils/cx';
import { useLanguage } from '@/shared/i18n/context';
import { formatNumber } from '@/shared/i18n/formatters';
import { buildRoutes } from '@/shared/config/routes';
import { CURRENCY_COLOR, CURRENCY_GLYPH } from '../lib/currency';
import type { WalletBalanceView } from '../server/shop.types';

const { coins: COIN_GLYPH, gems: GEM_GLYPH } = CURRENCY_GLYPH;
const { coins: COIN_COLOR, gems: GEM_COLOR } = CURRENCY_COLOR;

export interface ShopTopBarLabels {
  eyebrow: string;
  title: string;
  nav: { shop: string; inventory: string; wallet: string };
  topUp: string;
}

export interface ShopTopBarProps {
  balance: WalletBalanceView;
  labels: ShopTopBarLabels;
  onTopUp?: () => void;
}

const BALANCE_CHIP_VARIANTS = {
  coins: 'bg-[rgba(251,191,36,0.08)] border-[rgba(251,191,36,0.25)]',
  gems: 'bg-[rgba(167,139,250,0.08)] border-[rgba(167,139,250,0.25)]',
} as const;

type BalanceCurrency = keyof typeof BALANCE_CHIP_VARIANTS;

function BalanceChip({
  currency,
  className,
  ...props
}: {
  currency: BalanceCurrency;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center gap-2 px-3 py-2 rounded-xl border',
        BALANCE_CHIP_VARIANTS[currency],
        className,
      )}
      {...props}
    />
  );
}

function NavLink({
  color,
  className,
  ...props
}: {
  color?: string;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border px-[10px] py-[6px] rounded-lg text-[14px] tracking-[0.5px] uppercase font-bold transition-colors',
        color === '$white' ? 'text-[#f5f7ff]' : 'text-[#94a3b8]',
        'hover:text-[#f5f7ff] hover:bg-[rgba(255,255,255,0.04)]',
        className,
      )}
      {...props}
    />
  );
}

function TopUpBtn({
  onPress,
  className,
  ...props
}: {
  onPress?: () => void;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center gap-1 px-3 py-2 rounded-xl border border-dashed border-[rgba(255,255,255,0.18)] cursor-pointer transition-colors hover:border-[rgba(167,139,250,0.6)] hover:bg-[rgba(167,139,250,0.06)]',
        className,
      )}
      onClick={onPress}
      {...props}
    />
  );
}

export function ShopTopBar({ balance, labels, onTopUp }: ShopTopBarProps) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const { locale } = useLanguage();
  const routes = buildRoutes(locale);
  const { coins, gems } = balance;

  const handleTopUp = () => {
    if (onTopUp) {
      onTopUp();
      return;
    }
    router.push(routes.wallet);
  };

  // Active-state highlight: SHOP lights up on /shop (but not on the
  // inventory sub-route), INVENTORY on /shop/inventory. Compared by
  // suffix so the locale prefix doesn't have to be threaded in.
  const isInventory = pathname.endsWith('/shop/inventory');
  const isShop =
    !isInventory && (pathname.endsWith('/shop') || pathname.includes('/shop/'));

  return (
    <div
      className="box-border flex flex-row w-full items-center justify-between gap-4 flex-wrap"
      data-testid="shop-top-bar"
    >
      <div className="box-border flex flex-col items-stretch gap-2">
        <span className="box-border text-[48px] tracking-[2px] uppercase text-[#94a3b8]">
          {labels.eyebrow}
        </span>
        <span className="box-border text-[40px] font-black tracking-[-0.5px]">
          {labels.title}
        </span>
      </div>

      <div
        className="box-border flex flex-row gap-1 items-center max-[800px]:hidden"
        data-testid="shop-top-bar-nav"
      >
        <Link href={routes.shop} style={{ textDecoration: 'none' }}>
          <NavLink
            color={isShop ? '$white' : '$gray11'}
            data-testid="shop-nav-shop"
            data-active={isShop ? 'true' : 'false'}
          >
            {labels.nav.shop}
          </NavLink>
        </Link>
        <Link href={routes.shopInventory} style={{ textDecoration: 'none' }}>
          <NavLink
            color={isInventory ? '$white' : '$gray11'}
            data-testid="shop-nav-inventory"
            data-active={isInventory ? 'true' : 'false'}
          >
            {labels.nav.inventory}
          </NavLink>
        </Link>
        <Link href={routes.wallet} style={{ textDecoration: 'none' }}>
          <NavLink data-testid="shop-nav-wallet">{labels.nav.wallet}</NavLink>
        </Link>
      </div>

      <div className="box-border flex flex-row gap-2 items-center">
        <BalanceChip currency="coins" data-testid="shop-balance-coins">
          <span className="box-border text-[16px]">{COIN_GLYPH}</span>
          <span
            className="box-border text-[18px] font-bold"
            style={{ color: COIN_COLOR }}
          >
            {formatNumber(coins, locale)}
          </span>
        </BalanceChip>
        <BalanceChip currency="gems" data-testid="shop-balance-gems">
          <span className="box-border text-[16px]">{GEM_GLYPH}</span>
          <span
            className="box-border text-[18px] font-bold"
            style={{ color: GEM_COLOR }}
          >
            {formatNumber(gems, locale)}
          </span>
        </BalanceChip>
        <TopUpBtn onPress={handleTopUp} role="button" data-testid="shop-top-up">
          <span
            className="box-border text-[16px] font-bold"
            style={{ color: GEM_COLOR }}
          >
            +
          </span>
          <span className="box-border text-[14px] font-bold tracking-[0.5px]">
            {labels.topUp}
          </span>
        </TopUpBtn>
      </div>
    </div>
  );
}
