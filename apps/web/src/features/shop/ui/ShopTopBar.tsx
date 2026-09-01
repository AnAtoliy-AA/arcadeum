'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cx } from '@arcadeum/ui/utils/cx';
import { Typography } from '@arcadeum/ui';
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
  nav: { shop: string; inventory: string; wallet: string; rewards?: string };
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
  'data-testid': dataTestId,
  children,
}: {
  currency: BalanceCurrency;
  className?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'flex flex-row items-center gap-2 px-3 py-2 rounded-xl border',
        BALANCE_CHIP_VARIANTS[currency],
        className,
      )}
    >
      {children}
    </div>
  );
}

function NavLink({
  active,
  className,
  'data-testid': dataTestId,
  children,
}: {
  active?: boolean;
  className?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}) {
  return (
    <Typography
      uiSize="sm"
      weight="700"
      tracking="sm"
      color={active ? 'var(--color)' : 'var(--textSecondary)'}
      data-testid={dataTestId}
      className={cx(
        'px-[10px] py-[6px] rounded-lg uppercase transition-colors',
        'hover:text-[var(--color)] hover:bg-[var(--backgroundHover)]',
        className,
      )}
    >
      {children}
    </Typography>
  );
}

function TopUpBtn({
  onClick,
  className,
  role,
  'data-testid': dataTestId,
  children,
}: {
  onClick?: () => void;
  className?: string;
  role?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      role={role}
      data-testid={dataTestId}
      onClick={onClick}
      className={cx(
        'flex flex-row items-center gap-1 px-3 py-2 rounded-xl border border-dashed border-[rgba(255,255,255,0.18)] cursor-pointer transition-colors hover:border-[rgba(167,139,250,0.6)] hover:bg-[rgba(167,139,250,0.06)]',
        className,
      )}
    >
      {children}
    </div>
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
      className="flex flex-row w-full items-center justify-between gap-4 flex-wrap"
      data-testid="shop-top-bar"
    >
      <div className="flex flex-col items-stretch gap-2">
        <Typography
          uiSize="3xl"
          variant="heading"
          color="#94a3b8"
          tracking="lg"
          className="uppercase"
        >
          {labels.eyebrow}
        </Typography>
        <Typography uiSize="3xl" variant="heading">
          {labels.title}
        </Typography>
      </div>

      <div
        className="flex flex-row gap-1 items-center max-[800px]:hidden"
        data-testid="shop-top-bar-nav"
      >
        <Link href={routes.shop} style={{ textDecoration: 'none' }}>
          <NavLink active={isShop} data-testid="shop-nav-shop">
            {labels.nav.shop}
          </NavLink>
        </Link>
        <Link href={routes.shopInventory} style={{ textDecoration: 'none' }}>
          <NavLink active={isInventory} data-testid="shop-nav-inventory">
            {labels.nav.inventory}
          </NavLink>
        </Link>
        <Link href={routes.wallet} style={{ textDecoration: 'none' }}>
          <NavLink data-testid="shop-nav-wallet">{labels.nav.wallet}</NavLink>
        </Link>
        <Link href={routes.rewards} style={{ textDecoration: 'none' }}>
          <NavLink data-testid="shop-nav-rewards">
            <span className="flex items-center gap-1.5">
              <span>{labels.nav.rewards ?? 'Rewards'}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                FREE
              </span>
            </span>
          </NavLink>
        </Link>
      </div>

      <div className="flex flex-row gap-2 items-center">
        <BalanceChip currency="coins" data-testid="shop-balance-coins">
          <Typography uiSize="md">{COIN_GLYPH}</Typography>
          <Typography uiSize="lg" weight="700" color={COIN_COLOR}>
            {formatNumber(coins, locale)}
          </Typography>
        </BalanceChip>
        <BalanceChip currency="gems" data-testid="shop-balance-gems">
          <Typography uiSize="md">{GEM_GLYPH}</Typography>
          <Typography uiSize="lg" weight="700" color={GEM_COLOR}>
            {formatNumber(gems, locale)}
          </Typography>
        </BalanceChip>
        <TopUpBtn onClick={handleTopUp} role="button" data-testid="shop-top-up">
          <Typography uiSize="md" weight="700" color={GEM_COLOR}>
            +
          </Typography>
          <Typography uiSize="sm" weight="700" tracking="sm">
            {labels.topUp}
          </Typography>
        </TopUpBtn>
      </div>
    </div>
  );
}
