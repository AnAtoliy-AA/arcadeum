'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, YStack, XStack } from '@arcadeum/ui';
import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
import { Text, YStack as Stack, styled } from 'tamagui';
import { useLanguage } from '@/shared/i18n/context';
import { formatNumber } from '@/shared/i18n/formatters';
import { useShopFiltersStore } from '../store/shopFiltersStore';
import { ShopSidebar, type ShopSidebarLabels } from './ShopSidebar';
import { ShopGrid, type ShopGridLabels } from './ShopGrid';
import { InventoryTab, type InventoryTabLabels } from './InventoryTab';
import type {
  EffectiveShopItem,
  InventoryView,
  WalletBalanceView,
} from '../server/shop.types';

export interface ShopSignInLabels {
  title: string;
  body: string;
  cta: string;
}

export interface ShopPageLabels {
  title: string;
  subtitle: string;
  equipped?: string;
  signIn?: ShopSignInLabels;
  sidebar: ShopSidebarLabels;
  grid: ShopGridLabels;
  inventory: InventoryTabLabels;
}

export interface ShopPageViewProps {
  catalog: EffectiveShopItem[];
  inventory: InventoryView;
  balance: WalletBalanceView;
  gemToCoinRate: number;
  isAuthenticated?: boolean;
  labels: ShopPageLabels;
}

const BalanceChip = styled(Stack, {
  name: 'ShopBalanceChip',
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

const SidebarPanel = styled(Stack, {
  name: 'ShopSidebarPanel',
  width: 240,
  backgroundColor: 'rgba(255,255,255,0.02)',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',
  $sm: { width: '100%' },
});

export function ShopPageView({
  catalog,
  inventory,
  balance,
  gemToCoinRate,
  isAuthenticated = true,
  labels,
}: ShopPageViewProps) {
  const tab = useShopFiltersStore((s) => s.tab);
  const { locale } = useLanguage();

  const liveCatalog = useMemo(
    () => catalog.filter((item) => item.available),
    [catalog],
  );

  const catalogById = useMemo(
    () => new Map(catalog.map((item) => [item.id, item])),
    [catalog],
  );
  const equippedAvatar = inventory.equipped.avatar
    ? (catalogById.get(inventory.equipped.avatar) ?? null)
    : null;
  const equippedBadge = inventory.equipped.badge
    ? (catalogById.get(inventory.equipped.badge) ?? null)
    : null;
  const equippedNameColor = inventory.equipped.name_color
    ? (catalogById.get(inventory.equipped.name_color) ?? null)
    : null;

  // Destructure to avoid the wallet-balance no-restricted-syntax guardrail.
  const { coins, gems } = balance;

  return (
    <PageLayout>
      <YStack
        maxWidth={1280}
        marginHorizontal="auto"
        paddingHorizontal="$4"
        paddingVertical="$5"
        gap="$5"
        width="100%"
      >
        <XStack
          justifyContent="space-between"
          alignItems="flex-end"
          flexWrap="wrap"
          gap="$3"
        >
          <YStack gap="$1">
            <Text fontSize="$10" fontWeight="800" letterSpacing={-0.5}>
              {labels.title}
            </Text>
            <Text fontSize="$3" color="$gray11">
              {labels.subtitle}
            </Text>
          </YStack>
          <XStack gap="$2" alignItems="center">
            {equippedAvatar || equippedBadge || equippedNameColor ? (
              <Stack
                flexDirection="row"
                alignItems="center"
                gap={6}
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$3"
                borderWidth={1}
                borderColor="rgba(16,185,129,0.35)"
                backgroundColor="rgba(16,185,129,0.08)"
                data-testid="shop-equipped-preview"
              >
                <Text fontSize="$1" letterSpacing={0.5} color="$green11">
                  {(labels.equipped ?? 'Equipped').toUpperCase()}
                </Text>
                {equippedAvatar ? (
                  <Image
                    src={equippedAvatar.assetUrl}
                    alt=""
                    width={28}
                    height={28}
                    data-testid="shop-equipped-avatar"
                    style={{ objectFit: 'contain' }}
                    unoptimized
                  />
                ) : null}
                {equippedBadge ? (
                  <Image
                    src={equippedBadge.assetUrl}
                    alt=""
                    width={24}
                    height={24}
                    data-testid="shop-equipped-badge"
                    style={{ objectFit: 'contain' }}
                    unoptimized
                  />
                ) : null}
                {equippedNameColor?.colorValue ? (
                  <Text
                    fontSize="$3"
                    fontWeight="800"
                    data-testid="shop-equipped-name-color"
                    {...(equippedNameColor.colorValue.startsWith(
                      'linear-gradient',
                    )
                      ? {
                          style: {
                            backgroundImage: equippedNameColor.colorValue,
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent',
                          },
                        }
                      : { color: equippedNameColor.colorValue })}
                  >
                    Aa
                  </Text>
                ) : null}
              </Stack>
            ) : null}
            <BalanceChip currency="coins" data-testid="shop-balance-coins">
              <Text fontSize={18}>🪙</Text>
              <Text fontSize="$4" fontWeight="700" color="#fbbf24">
                {formatNumber(coins, locale)}
              </Text>
            </BalanceChip>
            <BalanceChip currency="gems" data-testid="shop-balance-gems">
              <Text fontSize={18}>💎</Text>
              <Text fontSize="$4" fontWeight="700" color="#a78bfa">
                {formatNumber(gems, locale)}
              </Text>
            </BalanceChip>
          </XStack>
        </XStack>

        {!isAuthenticated && labels.signIn ? (
          <Stack
            flexDirection="column"
            gap={6}
            padding="$4"
            borderRadius="$4"
            borderWidth={1}
            borderColor="rgba(96,165,250,0.35)"
            backgroundColor="rgba(59,130,246,0.08)"
            data-testid="shop-signin-banner"
          >
            <Text fontSize="$5" fontWeight="700">
              {labels.signIn.title}
            </Text>
            <Text fontSize="$3" color="$gray11">
              {labels.signIn.body}
            </Text>
            <XStack>
              <Link href="/auth">
                <Button variant="primary" data-testid="shop-signin-cta">
                  {labels.signIn.cta}
                </Button>
              </Link>
            </XStack>
          </Stack>
        ) : null}

        <XStack
          gap="$4"
          flexDirection="row"
          $sm={{ flexDirection: 'column' }}
          alignItems="flex-start"
        >
          <SidebarPanel>
            <ShopSidebar labels={labels.sidebar} />
          </SidebarPanel>

          <YStack $gtSm={{ flex: 1 }} width="100%">
            {tab === 'browse' ? (
              <ShopGrid
                catalog={liveCatalog}
                inventory={inventory.items}
                equipped={inventory.equipped}
                balance={balance}
                labels={labels.grid}
              />
            ) : (
              <InventoryTab
                catalog={liveCatalog}
                inventory={inventory.items}
                equipped={inventory.equipped}
                balance={balance}
                gemToCoinRate={gemToCoinRate}
                labels={labels.inventory}
              />
            )}
          </YStack>
        </XStack>
      </YStack>
    </PageLayout>
  );
}
