import { TamaguiAppLayout } from './TamaguiAppLayout';

/**
 * Server layout for every route except the home page. Delegates to the
 * client layout that provides the theme context.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <TamaguiAppLayout>{children}</TamaguiAppLayout>;
}
