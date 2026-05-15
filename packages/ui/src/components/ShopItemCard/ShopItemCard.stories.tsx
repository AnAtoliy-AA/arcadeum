import type { Meta, StoryObj } from '@storybook/react';
import { XStack } from 'tamagui';
import { ShopItemCard } from './ShopItemCard';

const meta: Meta<typeof ShopItemCard> = {
  title: 'Shop/ShopItemCard',
  component: ShopItemCard,
};

export default meta;
type Story = StoryObj<typeof ShopItemCard>;

const Frame = ({ children }: { children: React.ReactNode }) => (
  <XStack
    padding="$4"
    backgroundColor="$background"
    gap="$3"
    flexWrap="wrap"
  >
    {children}
  </XStack>
);

export const CommonCoins: Story = {
  render: () => (
    <Frame>
      <div style={{ width: 200 }}>
        <ShopItemCard
          itemId="avatar-fox-01"
          name="Fox"
          rarity="common"
          assetUrl="/shop/avatars/fox-01.png"
          priceAmount={200}
          priceCurrency="coins"
        />
      </div>
    </Frame>
  ),
};

export const RareGems: Story = {
  render: () => (
    <Frame>
      <div style={{ width: 200 }}>
        <ShopItemCard
          itemId="avatar-dragon-01"
          name="Dragon"
          rarity="rare"
          assetUrl="/shop/avatars/dragon-01.png"
          priceAmount={3}
          priceCurrency="gems"
        />
      </div>
    </Frame>
  ),
};

export const EpicOwned: Story = {
  render: () => (
    <Frame>
      <div style={{ width: 200 }}>
        <ShopItemCard
          itemId="avatar-phoenix-01"
          name="Phoenix"
          rarity="epic"
          assetUrl="/shop/avatars/phoenix-01.png"
          priceAmount={10}
          priceCurrency="gems"
          owned
        />
      </div>
    </Frame>
  ),
};

export const LegendaryEquipped: Story = {
  render: () => (
    <Frame>
      <div style={{ width: 200 }}>
        <ShopItemCard
          itemId="avatar-cosmic-01"
          name="Cosmic"
          rarity="legendary"
          assetUrl="/shop/avatars/cosmic-01.png"
          priceAmount={30}
          priceCurrency="gems"
          owned
          equipped
        />
      </div>
    </Frame>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Frame>
      <div style={{ width: 200 }}>
        <ShopItemCard
          itemId="avatar-cosmic-01"
          name="Cosmic"
          rarity="legendary"
          assetUrl="/shop/avatars/cosmic-01.png"
          priceAmount={30}
          priceCurrency="gems"
          disabled
        />
      </div>
    </Frame>
  ),
};
