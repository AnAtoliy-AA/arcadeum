import { buildContactStyles, type ContactStyles } from './ContactView.styles';

/**
 * Resolve theme-dependent contact styles from the CSS variables minted on
 * <html> by ThemeContext (var(--x) resolves at render time, no hook needed).
 */
export function getContactStyles(): ContactStyles {
  return buildContactStyles({
    accent: 'var(--accent)',
    glassBorder: 'var(--glassBorder)',
    glassBg: 'var(--glassBg)',
    background: 'var(--background)',
    color: 'var(--color)',
    textSecondary: 'var(--textSecondary)',
  });
}
