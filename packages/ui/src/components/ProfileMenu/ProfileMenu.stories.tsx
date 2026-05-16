import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { YStack, XStack } from 'tamagui';
import {
  ProfileMenuContainer,
  ProfileDropdownWrapper,
  DropdownLink,
  DropdownButton,
} from './ProfileMenu.styles';
import {
  WalletIcon,
  SettingsIcon,
  BarChartIcon,
  GiftIcon,
  FileTextIcon,
  LockIcon,
  MailIcon,
  LogoutIcon,
  UserIcon,
} from '../Icons';

const meta: Meta<typeof ProfileMenuContainer> = {
  title: 'Components/ProfileMenu',
  component: ProfileMenuContainer,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <YStack padding="$10" minHeight={500} width={400} alignItems="center">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProfileMenuContainer>;

export const Default: Story = {
  render: () => (
    <ProfileMenuContainer>
      <ProfileDropdownWrapper isOpen={true} position="relative" top={0}>
        <DropdownLink href="#" icon={<UserIcon size={18} />}>
          Admin
        </DropdownLink>
        <YStack height={1} backgroundColor="$borderColor" opacity={0.5} marginVertical="$1" />
        
        <DropdownLink href="#" icon={<WalletIcon size={18} />}>
          Wallet
        </DropdownLink>
        <DropdownLink href="#" icon={<SettingsIcon size={18} />}>
          Settings
        </DropdownLink>
        <DropdownLink href="#" icon={<BarChartIcon size={18} />}>
          Statistics
        </DropdownLink>
        <DropdownLink href="#" icon={<GiftIcon size={18} />}>
          Invite Friends
        </DropdownLink>
        
        <YStack height={1} backgroundColor="$borderColor" opacity={0.5} marginVertical="$1" />
        
        <DropdownLink href="#" icon={<FileTextIcon size={18} />}>
          Terms
        </DropdownLink>
        <DropdownLink href="#" icon={<LockIcon size={18} />}>
          Privacy
        </DropdownLink>
        <DropdownLink href="#" icon={<MailIcon size={18} />}>
          Contact
        </DropdownLink>
        
        <YStack height={1} backgroundColor="$borderColor" opacity={0.5} marginVertical="$1" />
        
        <DropdownButton icon={<LogoutIcon size={18} />}>
          Sign out
        </DropdownButton>
      </ProfileDropdownWrapper>
    </ProfileMenuContainer>
  ),
};
