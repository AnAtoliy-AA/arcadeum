/**
 * Translate a resolved name-color value (hex string or CSS linear-gradient
 * expression) into the props needed to render a colored or gradient-clipped
 * text node. Hex maps to a plain `color`; a gradient maps to a
 * background-clip-text style. Falls back to neutral props when null.
 */
export interface NameColorRenderProps {
  /** Pass to Tamagui Text `color` prop or React `style.color`. */
  color?: string;
  /** Pass to the underlying element via `style={...}` for gradient names. */
  style?: React.CSSProperties;
}

export function nameColorRenderProps(
  value: string | null | undefined,
): NameColorRenderProps {
  if (!value) return {};
  if (
    value.startsWith('linear-gradient') ||
    value.startsWith('radial-gradient')
  ) {
    return {
      style: {
        backgroundImage: value,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
      },
    };
  }
  return { color: value };
}
