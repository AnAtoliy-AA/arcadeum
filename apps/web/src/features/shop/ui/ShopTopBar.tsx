'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { XStack, YStack } from '@arcadeum/ui';
import { Text, styled, YStack as Stack } from 'tamagui';
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

const BalanceChip = styled(Stack, {
  name: 'ShopTopBarBalanceChip',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderRadius: '$3',
  borderWidth: 1,

  variants: {
    currency: {
      coins: {
        backgroundColor: 'rgba(251,191,36,0.08)',
        borderColor: 'rgba(251,191,36,0.25)',
      },
      gems: {
        backgroundColor: 'rgba(167,139,250,0.08)',
        borderColor: 'rgba(167,139,250,0.25)',
      },
    },
  } as const,
});

const NavLink = styled(Text, {
  name: 'ShopTopBarNavLink',
  fontSize: '$2',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  fontWeight: '700',
  color: '$gray11',
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: '$2',
  hoverStyle: { color: '$white', backgroundColor: 'rgba(255,255,255,0.04)' },
});

const TopUpBtn = styled(Stack, {
  name: 'ShopTopBarTopUp',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
  borderStyle: 'dashed',
  cursor: 'pointer',
  hoverStyle: {
    borderColor: 'rgba(167,139,250,0.6)',
    backgroundColor: 'rgba(167,139,250,0.06)',
  },
});

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
    !isInventory &&
    (pathname.endsWith('/shop') || pathname.includes('/shop/'));

  return (
    <XStack
      width="100%"
      alignItems="center"
      justifyContent="space-between"
      gap="$4"
      flexWrap="wrap"
      data-testid="shop-top-bar"
    >
      <YStack gap={2}>
        <Text
          fontSize={10}
          letterSpacing={2}
          textTransform="uppercase"
          color="$gray11"
        >
          {labels.eyebrow}
        </Text>
        <Text fontSize="$9" fontWeight="900" letterSpacing={-0.5}>
          {labels.title}
        </Text>
      </YStack>

      <XStack
        gap="$1"
        alignItems="center"
        $sm={{ display: 'none' }}
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
      </XStack>

      <XStack gap="$2" alignItems="center">
        <BalanceChip currency="coins" data-testid="shop-balance-coins">
          <Text fontSize={16}>{COIN_GLYPH}</Text>
          <Text fontSize="$4" fontWeight="700" color={COIN_COLOR}>
            {formatNumber(coins, locale)}
          </Text>
        </BalanceChip>
        <BalanceChip currency="gems" data-testid="shop-balance-gems">
          <Text fontSize={16}>{GEM_GLYPH}</Text>
          <Text fontSize="$4" fontWeight="700" color={GEM_COLOR}>
            {formatNumber(gems, locale)}
          </Text>
        </BalanceChip>
        <TopUpBtn onPress={handleTopUp} role="button" data-testid="shop-top-up">
          <Text fontSize="$3" fontWeight="700" color={GEM_COLOR}>
            +
          </Text>
          <Text fontSize="$2" fontWeight="700" letterSpacing={0.5}>
            {labels.topUp}
          </Text>
        </TopUpBtn>
      </XStack>
    </XStack>
  );
}
