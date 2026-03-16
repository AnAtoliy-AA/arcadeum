import { GetProps } from 'tamagui';
import { StyledButton } from './StyledButton';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'icon'
  | 'link'
  | 'chip'
  | 'listItem'
  | 'glass'
  | 'outline'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'info'
  | 'victory';

export type GameVariant = 'cyberpunk' | 'underwater' | 'crime' | 'horror' | 'adventure' | 'high-altitude-hike';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<GetProps<typeof StyledButton>, 'size' | 'onClick'> & {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  showShimmer?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  pulse?: boolean;
  isActive?: boolean;
  pill?: boolean;
  gameVariant?: GameVariant;
  onPress?: GetProps<typeof StyledButton>['onPress'];
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  title?: string;
  icon?: React.ReactNode;
};
