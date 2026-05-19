'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { XStack, YStack } from '@arcadeum/ui';
import { Text, styled, YStack as Stack } from 'tamagui';
import { useLanguage } from '@/shared/i18n/context';
import { formatNumber } from '@/shared/i18n/formatters';
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

// Sticky-chrome breathing room — matches ShopMannequinRail.SCROLL_OFFSET so
// the inventory rail isn't tucked under the top bar after the jump.
const SCROLL_OFFSET = 80;

export function ShopTopBar({ balance, labels, onTopUp }: ShopTopBarProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const { coins, gems } = balance;

  const handleTopUp = () => {
    if (onTopUp) {
      onTopUp();
      return;
    }
    router.push('/wallet');
  };

  // Anchor-style <Link href="#x"> doesn't scroll inside PageLayout's
  // custom scroll container — same constraint that drives
  // ShopMannequinRail.onSlotClick to use window.scrollTo directly.
  const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToInventory = () => {
    if (typeof window === 'undefined') return;
    // Falls back to the mannequin rail (#shop-rail) if the inventory
    // section isn't on the page — e.g. the user is signed out, or hasn't
    // bought anything yet so ShopPageView elides the block.
    const target =
      document.getElementById('shop-inventory') ??
      document.getElementById('shop-rail');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const top = rect.top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const onNavKey =
    (handler: () => void) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    };

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
        <NavLink
          color="$white"
          cursor="pointer"
          role="button"
          tabIndex={0}
          onPress={scrollToTop}
          onKeyDown={onNavKey(scrollToTop)}
          data-testid="shop-nav-shop"
        >
          {labels.nav.shop}
        </NavLink>
        {/* Inventory was folded into the mannequin rail — the link
            scroll-jumps to the rail rather than opening a separate page.
            Manual scroll is required because PageLayout's scroll container
            ignores browser anchor-link defaults (same reason
            ShopMannequinRail.onSlotClick uses window.scrollTo for its
            slot jumps). */}
        <NavLink
          cursor="pointer"
          role="button"
          tabIndex={0}
          onPress={scrollToInventory}
          onKeyDown={onNavKey(scrollToInventory)}
          data-testid="shop-nav-inventory"
        >
          {labels.nav.inventory}
        </NavLink>
        <Link href="/wallet" style={{ textDecoration: 'none' }}>
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
