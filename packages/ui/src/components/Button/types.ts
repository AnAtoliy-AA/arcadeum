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
export type ResponsiveProp<T> = T | { [key: string]: T };


export type ButtonProps = Omit<GetProps<typeof StyledButton>, 'size' | 'onClick' | '$uiSize' | 'buttonSize'> & {
  children?: React.ReactNode;
  variant?: ResponsiveProp<ButtonVariant>;
  size?: ResponsiveProp<ButtonSize>;
  loading?: boolean;
  showShimmer?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  pulse?: boolean;
  jump?: boolean;
  isActive?: boolean;
  pill?: boolean;
  gameVariant?: GameVariant;
  /** @deprecated Use onClick instead */
  onPress?: GetProps<typeof StyledButton>['onPress'];
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  ref?: React.Ref<HTMLButtonElement>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-pressed'?: boolean | 'true' | 'false';
  title?: string;
  icon?: React.ReactNode;
};
