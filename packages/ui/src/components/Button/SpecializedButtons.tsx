import React from 'react';
import { Button } from './Button';
import { LinkButton, type LinkButtonProps } from './LinkButton';
import { ArrowRightIcon, PlusCircleIcon } from '../Icons/index';
import type { ButtonProps, GameVariant } from './types';

export interface BotCountButtonProps extends ButtonProps {
  isActive?: boolean;
}

export const BotCountButton = ({
  $isActive: isActive,
  children,
  testId,
  ...props
}: BotCountButtonProps) => (
  <Button
    variant="chip"
    size="sm"
    data-active={isActive}
    width={32}
    height={32}
    padding={0}
    borderRadius={8}
    fontWeight="600"
    backgroundColor={
      isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'
    }
    borderColor={
      isActive ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.1)'
    }
    color={isActive ? '#6366f1' : '$color'}
    hoverStyle={{
      backgroundColor: isActive
        ? 'rgba(99, 102, 241, 0.25)'
        : 'rgba(255, 255, 255, 0.1)',
      borderColor: isActive
        ? 'rgba(99, 102, 241, 0.6)'
        : 'rgba(255, 255, 255, 0.2)',
    }}
    data-testid={testId || props['data-testid']}
    {...props}
  >
    {children}
  </Button>
);

export const DeleteButton = ({
  children,
  testId,
  width = '100%',
  ...props
}: ButtonProps) => (
  <Button
    variant="primary"
    size="lg"
    $sm={{ $uiSize: 'md', borderRadius: 8 }}
    $short={{ $uiSize: 'sm', borderRadius: 8 }}
    width={width}
    fontWeight="600"
    borderRadius={12}
    backgroundColor="#ef4444"
    color="white"
    shadowColor="rgba(239, 68, 68, 0.3)"
    shadowRadius={16}
    shadowOffset={{ width: 0, height: 4 }}
    hoverStyle={{
      y: -2,
      shadowRadius: 24,
      shadowColor: 'rgba(239, 68, 68, 0.4)',
    }}
    disabledStyle={{
      opacity: 0.5,
      shadowRadius: 16,
    }}
    data-testid={testId || props['data-testid']}
    {...props}
  >
    {children}
  </Button>
);

export const StartButton = ({
  children,
  testId,
  width = '100%',
  className,
  ...props
}: ButtonProps & { className?: string }) => (
  // The pulse + shimmer live on a wrapper because Tamagui's styled
  // components drop unknown classNames from the prop chain (verified
  // in the rendered DOM — only Tamagui's atomic _bg-* / _pos-* etc.
  // survive). Wrapping in a plain <div> keeps the animation styles
  // outside Tamagui's prop system entirely, and the button itself
  // stays a normal Tamagui Button.
  <div
    className={['start-button-glow', className].filter(Boolean).join(' ')}
    style={{
      display: 'inline-block',
      borderRadius: 12,
      width: width as string | number,
    }}
  >
    <Button
      variant="primary"
      size="lg"
      $sm={{ $uiSize: 'md', borderRadius: 8 }}
      $short={{ $uiSize: 'sm', borderRadius: 8 }}
      width="100%"
      fontWeight="700"
      fontSize={18}
      letterSpacing={0.5}
      borderRadius={12}
      backgroundColor="#c7aa2f"
      color="#1a1a2e"
      shadowColor="rgba(199, 170, 47, 0.55)"
      shadowRadius={28}
      shadowOffset={{ width: 0, height: 6 }}
      hoverStyle={{
        y: -2,
        shadowRadius: 36,
        shadowColor: 'rgba(199, 170, 47, 0.7)',
        backgroundColor: '#d6b933',
      }}
      disabledStyle={{
        opacity: 0.5,
        shadowRadius: 16,
      }}
      data-testid={testId || props['data-testid']}
      {...props}
    >
      {children}
    </Button>
  </div>
);

export const IconButton = ({
  children,
  testId,
  backgroundColor = 'rgba(255, 255, 255, 0.05)',
  borderColor = 'rgba(255, 255, 255, 0.1)',
  size = 'sm',
  ...props
}: ButtonProps) => (
  <Button
    variant="icon"
    size={size}
    backgroundColor={backgroundColor}
    borderColor={borderColor}
    hoverStyle={{ rotate: '180deg', scale: 1.1, ...props.hoverStyle }}
    data-testid={testId || props['data-testid']}
    {...props}
  >
    {children}
  </Button>
);

export const RefreshButton = ({
  children,
  testId,
  opacity = 0.7,
  ...props
}: ButtonProps) => (
  <IconButton
    circular
    padding={4}
    hoverStyle={{ rotate: '30deg', opacity: 1 }}
    pressStyle={{ rotate: '180deg' }}
    opacity={opacity}
    testId={testId || props['data-testid']}
    {...props}
  >
    {children}
  </IconButton>
);
export interface ModalButtonProps extends ButtonProps { }

export const ModalButton = (props: ModalButtonProps) => (
  <Button flex={1} {...props} />
);

export interface OptionButtonProps extends ButtonProps {
  $selected?: boolean;
  $variant?: string;
}

export const OptionButton = ({
  $selected,
  $variant,
  ...props
}: OptionButtonProps) => (
  <Button
    variant="chip"
    size="md"
    isActive={$selected}
    gameVariant={$variant as GameVariant}
    p="$4"
    flexDirection="column"
    gap="$2"
    {...props}
  />
);

export const CreateRoomButton = (props: ButtonProps) => (
  <Button
    variant="victory"
    size="lg"
    $sm={{ $uiSize: 'md' }}
    $short={{ $uiSize: 'sm' }}
    pulse
    jump
    showShimmer
    fontWeight="800"
    letterSpacing={1}
    icon={<PlusCircleIcon size={24} />}
    {...props}
  />
);

export const CreateRoomLinkButton = (props: LinkButtonProps) => (
  <LinkButton
    variant="victory"
    size="lg"
    $sm={{ $uiSize: 'md' }}
    $short={{ $uiSize: 'sm' }}
    pulse
    jump
    showShimmer
    fontWeight="800"
    letterSpacing={1}
    icon={<PlusCircleIcon size={24} />}
    {...props}
  />
);

export const HomePrimaryButton = (props: ButtonProps) => (
  <Button
    variant="victory"
    size="lg"
    pulse
    jump
    showShimmer
    fontWeight="800"
    letterSpacing={1.5}
    icon={<ArrowRightIcon size={24} />}
    {...props}
  />
);

export const HomePrimaryLinkButton = (props: LinkButtonProps) => (
  <LinkButton
    variant="victory"
    size="lg"
    pulse
    jump
    showShimmer
    fontWeight="800"
    letterSpacing={1.5}
    icon={<ArrowRightIcon size={24} />}
    {...props}
  />
);
