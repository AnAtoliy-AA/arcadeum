import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
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
      <div className="flex flex-col items-center" style={{ padding: 40, minHeight: 500, width: 400 }}>
        <Story />
      </div>
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
        <div className="h-px my-1 bg-[var(--borderColor)] opacity-[0.5]" />
        
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
        
        <div className="h-px my-1 bg-[var(--borderColor)] opacity-[0.5]" />
        
        <DropdownLink href="#" icon={<FileTextIcon size={18} />}>
          Terms
        </DropdownLink>
        <DropdownLink href="#" icon={<LockIcon size={18} />}>
          Privacy
        </DropdownLink>
        <DropdownLink href="#" icon={<MailIcon size={18} />}>
          Contact
        </DropdownLink>
        
        <div className="h-px my-1 bg-[var(--borderColor)] opacity-[0.5]" />
        
        <DropdownButton icon={<LogoutIcon size={18} />}>
          Sign out
        </DropdownButton>
      </ProfileDropdownWrapper>
    </ProfileMenuContainer>
  ),
};
