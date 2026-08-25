export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'icon'
  | 'icon glass'
  | 'link'
  | 'chip'
  | 'listItem'
  | 'glass'
  | 'outline'
  | 'victory';

export type GameVariant =
  | 'cyberpunk'
  | 'underwater'
  | 'crime'
  | 'horror'
  | 'adventure'
  | 'high-altitude-hike';
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Corner shape — overrides the radius from the chosen size. */
export type ButtonShape = 'round' | 'square' | 'circle';

export type ButtonProps = {
  children?: React.ReactNode;
  /** Visual style. Pass an array to compose multiple variants. */
  variant?: ButtonVariant | ButtonVariant[];
  size?: ButtonSize;
  shape?: ButtonShape;
  loading?: boolean;
  showShimmer?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  pulse?: boolean;
  jump?: boolean;
  /** Selected state — `chip` becomes gold-tinted, other variants get a primary highlight. */
  active?: boolean;
  /** Outline form of a color variant (`variant="danger" outline`). */
  outline?: boolean;
  /** Ghost form of a color variant (`variant="danger" ghost`). */
  ghost?: boolean;
  /** 180° hover spin — used on `icon` / `iconGlass`. */
  rotatable?: boolean;
  gameVariant?: GameVariant;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  ref?: React.Ref<HTMLButtonElement>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  tabIndex?: number;
  title?: string;
  icon?: React.ReactNode;
  'data-testid'?: string;
  'data-active'?: string | boolean;
  'aria-label'?: string;
  'aria-pressed'?: boolean | 'true' | 'false';
  'aria-selected'?: boolean | 'true' | 'false';
  'aria-expanded'?: boolean | 'true' | 'false';
  'aria-haspopup'?: React.AriaAttributes['aria-haspopup'];
  'aria-controls'?: string;
  'aria-live'?: React.AriaAttributes['aria-live'];
  role?: React.AriaRole;
  onMouseEnter?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLButtonElement>;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
};