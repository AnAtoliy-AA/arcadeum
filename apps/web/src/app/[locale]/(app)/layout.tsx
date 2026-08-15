import { AppLayoutClient } from './AppLayoutClient';

/**
 * Server layout for every route except the home page. Delegates to the
 * client layout that provides the theme context.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
