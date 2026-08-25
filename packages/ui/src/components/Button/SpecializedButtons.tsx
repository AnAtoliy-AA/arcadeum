import React from 'react';
import { Button } from './Button';
import { LinkButton, type LinkButtonProps } from './LinkButton';
import { ArrowRightIcon, PlusCircleIcon } from '../Icons/index';
import { cx } from '../../utils/cx';
import type { ButtonProps, GameVariant } from './types';

type LinkButtonShape = Pick<
  LinkButtonProps,
  'href' | 'onClick' | 'data-testid' | 'children'
>;

export const BotCountButton = ({
  active,
  onClick,
  disabled,
  'data-testid': dataTestId,
  children,
}: Pick<ButtonProps, 'onClick' | 'disabled' | 'data-testid' | 'children'> & {
  active?: boolean;
}) => (
  <Button
    variant="chip"
    active={active}
    size="sm"
    disabled={disabled}
    onClick={onClick}
    data-testid={dataTestId}
    data-active={active ? 'on' : undefined}
    className="!px-2 !py-2 font-semibold"
  >
    {children}
  </Button>
);

export const DeleteButton = ({
  size,
  onClick,
  className,
  style,
  children,
}: Pick<ButtonProps, 'size' | 'onClick' | 'className' | 'style' | 'children'>) => (
  <Button
    variant="danger"
    size={size ?? 'lg'}
    onClick={onClick}
    className={
      className ??
      'w-full hover:-translate-y-[2px] max-[640px]:h-12 max-[640px]:px-6 max-[640px]:py-3 max-[640px]:rounded-[8px]'
    }
    style={style}
  >
    {children}
  </Button>
);

export const StartButton = ({
  width = '100%',
  onClick,
  disabled,
  loading,
  'data-testid': dataTestId,
  className,
  children,
}: Pick<
  ButtonProps,
  'onClick' | 'disabled' | 'loading' | 'data-testid' | 'className' | 'children'
> & { width?: string | number }) => (
  <div
    className={cx('start-button-glow', className)}
    style={{
      display: 'inline-block',
      borderRadius: 20,
      width: width as string | number,
    }}
  >
    <Button
      variant="victory"
      size="lg"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      data-testid={dataTestId}
      className={[
        'w-full',
        'text-lg',
        'tracking-wide',
        'hover:-translate-y-[2px]',
        'max-[640px]:h-12 max-[640px]:px-6 max-[640px]:py-3 max-[640px]:rounded-[8px]',
      ].join(' ')}
    >
      {children}
    </Button>
  </div>
);

export const IconButton = ({
  size = 'sm',
  variant,
  icon,
  title,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  disabled,
  onClick,
  className,
  style,
  children,
}: Omit<ButtonProps, 'variant'> & { variant?: ButtonProps['variant'] }) => (
  <Button
    variant={variant ?? 'icon'}
    size={size}
    icon={icon}
    title={title}
    aria-label={ariaLabel}
    data-testid={dataTestId}
    disabled={disabled}
    onClick={onClick}
    className={className}
    style={style}
  >
    {children}
  </Button>
);

export const RefreshButton = ({
  opacity = 0.7,
  onClick,
  'data-testid': dataTestId,
  title,
  children,
}: Pick<ButtonProps, 'onClick' | 'data-testid' | 'title' | 'children'> & {
  opacity?: string | number;
}) => (
  <IconButton
    rotatable
    shape="circle"
    onClick={onClick}
    data-testid={dataTestId}
    title={title}
    className="!p-1 hover:opacity-100"
    style={{ opacity }}
  >
    {children}
  </IconButton>
);

type ModalButtonOwnProps = {
  children?: ButtonProps['children'];
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  shape?: ButtonProps['shape'];
  loading?: boolean;
  showShimmer?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  pulse?: boolean;
  jump?: boolean;
  active?: boolean;
  outline?: boolean;
  ghost?: boolean;
  rotatable?: boolean;
  gameVariant?: GameVariant;
  onClick?: ButtonProps['onClick'];
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  type?: ButtonProps['type'];
  tabIndex?: number;
  title?: string;
  icon?: React.ReactNode;
  'data-testid'?: string;
  'aria-label'?: string;
};

export interface ModalButtonProps extends ModalButtonOwnProps {}

export const ModalButton = ({
  children,
  variant,
  size,
  shape,
  loading,
  showShimmer,
  fullWidth,
  disabled,
  pulse,
  jump,
  active,
  outline,
  ghost,
  rotatable,
  gameVariant,
  onClick,
  className,
  id,
  style,
  type,
  tabIndex,
  title,
  icon,
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
}: ModalButtonProps) => (
  <Button
    variant={variant}
    size={size}
    shape={shape}
    loading={loading}
    showShimmer={showShimmer}
    fullWidth={fullWidth}
    disabled={disabled}
    pulse={pulse}
    jump={jump}
    active={active}
    outline={outline}
    ghost={ghost}
    rotatable={rotatable}
    gameVariant={gameVariant}
    onClick={onClick}
    id={id}
    style={style}
    type={type}
    tabIndex={tabIndex}
    title={title}
    icon={icon}
    data-testid={dataTestId}
    aria-label={ariaLabel}
    className={className ?? 'flex-1'}
  >
    {children}
  </Button>
);

export interface OptionButtonProps extends ModalButtonOwnProps {}

export const OptionButton = ({
  active,
  disabled,
  gameVariant,
  onClick,
  style,
  children,
}: Pick<
  ModalButtonOwnProps,
  'active' | 'disabled' | 'gameVariant' | 'onClick' | 'style' | 'children'
>) => (
  <Button
    variant="chip"
    size="md"
    active={active}
    disabled={disabled}
    gameVariant={gameVariant}
    onClick={onClick}
    style={style}
    className="flex flex-col gap-2 !p-4"
  >
    {children}
  </Button>
);

export const CreateRoomButton = ({
  onClick,
  disabled,
  fullWidth,
  type,
  'data-testid': dataTestId,
  children,
}: Pick<
  ButtonProps,
  'onClick' | 'disabled' | 'fullWidth' | 'type' | 'data-testid' | 'children'
>) => (
  <Button
    variant="victory"
    size="lg"
    pulse
    jump
    showShimmer
    fullWidth={fullWidth}
    disabled={disabled}
    type={type}
    onClick={onClick}
    data-testid={dataTestId}
    icon={<PlusCircleIcon size={24} />}
    className="font-extrabold tracking-widest max-[640px]:h-12 max-[640px]:px-6 max-[640px]:py-3 max-[640px]:rounded-[16px]"
  >
    {children}
  </Button>
);

export const CreateRoomLinkButton = ({
  href,
  onClick,
  'data-testid': dataTestId,
  children,
}: LinkButtonShape) => (
  <LinkButton
    variant="victory"
    size="lg"
    pulse
    jump
    showShimmer
    href={href}
    onClick={onClick}
    data-testid={dataTestId}
    icon={<PlusCircleIcon size={24} />}
    className="max-[640px]:h-12 max-[640px]:px-6 max-[640px]:py-3 max-[640px]:rounded-[16px] [&>span]:font-extrabold [&>span]:tracking-widest"
  >
    {children}
  </LinkButton>
);

export const HomePrimaryButton = ({
  onClick,
  disabled,
  'data-testid': dataTestId,
  children,
}: Pick<ButtonProps, 'onClick' | 'disabled' | 'data-testid' | 'children'>) => (
  <Button
    variant="victory"
    size="lg"
    pulse
    jump
    showShimmer
    onClick={onClick}
    disabled={disabled}
    data-testid={dataTestId}
    icon={<ArrowRightIcon size={24} />}
    className="font-extrabold tracking-[1.5px]"
  >
    {children}
  </Button>
);

export const HomePrimaryLinkButton = ({
  href,
  onClick,
  'data-testid': dataTestId,
  children,
}: LinkButtonShape) => (
  <LinkButton
    variant="victory"
    size="lg"
    pulse
    jump
    showShimmer
    href={href}
    onClick={onClick}
    data-testid={dataTestId}
    icon={<ArrowRightIcon size={24} />}
    className="[&>span]:font-extrabold [&>span]:tracking-[1.5px]"
  >
    {children}
  </LinkButton>
);
