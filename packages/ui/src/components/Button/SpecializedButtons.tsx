import React from 'react';
import { Button } from './Button';
import { LinkButton, type LinkButtonProps } from './LinkButton';
import { ArrowRightIcon, PlusCircleIcon } from '../Icons/index';
import { cx } from '../../utils/cx';
import type { ButtonProps, GameVariant } from './types';

export const BotCountButton = ({
  active,
  children,
  ...props
}: ButtonProps & { active?: boolean }) => (
  <Button
    variant="chip"
    active={active}
    size="sm"
    data-active={active ? 'on' : undefined}
    className="!px-2 !py-2 font-semibold"
    {...props}
  >
    {children}
  </Button>
);

export const DeleteButton = ({ children, ...props }: ButtonProps) => (
  <Button
    variant="danger"
    size="lg"
    className={[
      'w-full',
      'hover:-translate-y-[2px]',
      'max-[640px]:h-12 max-[640px]:px-6 max-[640px]:py-3 max-[640px]:rounded-[8px]',
    ].join(' ')}
    {...props}
  >
    {children}
  </Button>
);

export const StartButton = ({
  children,
  width = '100%',
  className,
  ...props
}: ButtonProps & { className?: string; width?: string | number }) => (
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
      className={[
        'w-full',
        'text-lg',
        'tracking-wide',
        'hover:-translate-y-[2px]',
        'max-[640px]:h-12 max-[640px]:px-6 max-[640px]:py-3 max-[640px]:rounded-[8px]',
      ].join(' ')}
      {...props}
    >
      {children}
    </Button>
  </div>
);

export const IconButton = ({ children, size = 'sm', ...props }: ButtonProps) => (
  <Button variant="icon" size={size} {...props}>
    {children}
  </Button>
);

export const RefreshButton = ({
  children,
  opacity = 0.7,
  ...props
}: ButtonProps & { opacity?: string | number }) => (
  <IconButton
    rotatable
    shape="circle"
    className="!p-1 hover:opacity-100"
    style={{ opacity }}
    {...props}
  >
    {children}
  </IconButton>
);

export interface ModalButtonProps extends ButtonProps {}

export const ModalButton = (props: ModalButtonProps) => (
  <Button className="flex-1" {...props} />
);

export interface OptionButtonProps extends ButtonProps {}

export const OptionButton = (props: OptionButtonProps) => (
  <Button variant="chip" size="md" className="flex flex-col gap-2 !p-4" {...props} />
);

export const CreateRoomButton = (props: ButtonProps) => (
  <Button
    variant="victory"
    size="lg"
    pulse
    jump
    showShimmer
    icon={<PlusCircleIcon size={24} />}
    className="font-extrabold tracking-widest max-[640px]:h-12 max-[640px]:px-6 max-[640px]:py-3 max-[640px]:rounded-[16px]"
    {...props}
  />
);

export const CreateRoomLinkButton = (props: LinkButtonProps) => (
  <LinkButton
    variant="victory"
    size="lg"
    pulse
    jump
    showShimmer
    icon={<PlusCircleIcon size={24} />}
    className="max-[640px]:h-12 max-[640px]:px-6 max-[640px]:py-3 max-[640px]:rounded-[16px] [&>span]:font-extrabold [&>span]:tracking-widest"
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
    icon={<ArrowRightIcon size={24} />}
    className="font-extrabold tracking-[1.5px]"
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
    icon={<ArrowRightIcon size={24} />}
    className="[&>span]:font-extrabold [&>span]:tracking-[1.5px]"
    {...props}
  />
);